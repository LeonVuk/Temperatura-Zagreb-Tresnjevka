const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { Parser } = require('json2csv');
const openapiSpec = require('../openapi.json');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const session = require('express-session');
const { auth } = require('express-openid-connect');


const auth0Config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'tNIcjJd2ugrGH_qdjk2IzCZDbGN3Kj4mKXMVo20pCfpn5FdCGrC3MufGMvrwp0G1',
  baseURL: 'http://localhost:3000',
  clientID: '551M0V7sIrzXKDPNFM0t2lL4avJriwgZ',
  issuerBaseURL: 'https://dev-ljwyf82o1jh1m8ga.us.auth0.com'
};

app.use(auth(auth0Config));

app.use(session({
  secret: 'nntdfnntdfsxjn',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

function requiresAuth() {
  return (req, res, next) => {
    if (!req.oidc.isAuthenticated()) {
      return res.status(401).json({
        status: 'Unauthorized',
        message: 'Potrebna je prijava'
      });
    }
    next();
  };
}

app.use(express.static(path.join(__dirname, '..')));

const datatablePath = path.join(__dirname, '../datatable.html');
app.get('/datatable.html', requiresAuth(),(req, res) => {
    res.sendFile(datatablePath);
});

const profilePath = path.join(__dirname, '../profile.html');
app.get('/profile.html',requiresAuth(), (req, res) => {
    res.sendFile(profilePath);
});

const indexPath = path.join(__dirname, '../index.html');
app.get('/', (req, res) => {
    res.sendFile(indexPath);
});


app.get('/login', (req, res) => {
  res.oidc.login({
    returnTo: '/profile',
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email'
    }
  });
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.json({
    user: req.oidc.user,
    isAuthenticated: req.oidc.isAuthenticated()
  });
});

const JSONLD = path.join(__dirname, '../json-ld.json');
app.get('/api/v1/temperature/json-ld', requiresAuth(),(req, res) => {
    res.sendFile(JSONLD);
});


const baza = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'temperature_db',
    password: '12345',
    port: 5432,
});

function napraviUpit(pretraga, atribut) {
    const parametri = [];
    let upit = `
        SELECT l.naziv as lokacija, l.nadmorska_visina, l.vrsta_lokacije,
               l.latitude, l.longitude, s.naziv as senzor,
               s.vrsta_mjerenja, m.temperatura, 
               TO_CHAR(m.datum, 'DD.MM.YYYY.') as datum,
               m.vrijeme,
               TO_CHAR(m.datum + m.vrijeme, 'DD.MM.YYYY. HH24:MI:SS') as datum_vrijeme
        FROM mjerenja m
        JOIN lokacije l ON m.lokacija_id = l.id
        JOIN senzori s ON m.senzor_id = s.id
    `;

    if (pretraga) {
        const atributi = {
            'lokacija': 'l.naziv',
            'nadmorska_visina': 'l.nadmorska_visina::TEXT',
            'vrsta_lokacije': 'l.vrsta_lokacije',
            'latitude': 'l.latitude::TEXT',
            'longitude': 'l.longitude::TEXT',
            'senzor': 's.naziv',
            'vrsta_mjerenja': 's.vrsta_mjerenja',
            'temperatura': 'm.temperatura::TEXT',
            'datum': 'TO_CHAR(m.datum, \'DD.MM.YYYY.\')',
            'vrijeme': 'm.vrijeme::TEXT'
        };

        if (atribut && atribut !== 'sve') {
            upit += ` WHERE ${atributi[atribut]} ILIKE $1`;
            parametri.push(`%${pretraga}%`);
        } else {
            const uvjeti = Object.values(atributi).map(a => `${a} ILIKE $1`);
            upit += ` WHERE (${uvjeti.join(' OR ')})`;
            parametri.push(`%${pretraga}%`);
        }
    }

    upit += ` ORDER BY m.datum, m.vrijeme`;
    return { upit, parametri };
}

function uJSONFormat(podaci) {
    const lokacije = {};
    
    podaci.forEach(red => {
        const kljucLokacije = `${red.lokacija}|${red.latitude}|${red.longitude}`;
        if (!lokacije[kljucLokacije]) {
            lokacije[kljucLokacije] = {
                id: Object.keys(lokacije).length + 1,
                naziv: red.lokacija,
                nadmorska_visina: red.nadmorska_visina,
                vrsta_lokacije: red.vrsta_lokacije,
                latitude: red.latitude,
                longitude: red.longitude,
                senzori: {}
            };
        }

        const kljucSenzora = `${red.senzor}|${red.vrsta_mjerenja}`;
        if (!lokacije[kljucLokacije].senzori[kljucSenzora]) {
            lokacije[kljucLokacije].senzori[kljucSenzora] = {
                id: Object.keys(lokacije[kljucLokacije].senzori).length + 1,
                naziv: red.senzor,
                vrsta_mjerenja: red.vrsta_mjerenja,
                mjerenja: []
            };
        }

        lokacije[kljucLokacije].senzori[kljucSenzora].mjerenja.push({
            id: lokacije[kljucLokacije].senzori[kljucSenzora].mjerenja.length + 1,
            temperatura: parseFloat(red.temperatura),
            datum: red.datum,
            vrijeme: red.vrijeme,
            datum_vrijeme: red.datum_vrijeme
        });
    });

    return Object.values(lokacije).map(lok => ({
        ...lok,
        senzori: Object.values(lok.senzori)
    }));
}

app.get('/api/temperature',requiresAuth(), async (req, res) => {
    try {
        const { upit, parametri } = napraviUpit(req.query.search, req.query.attribute);
        const rezultat = await baza.query(upit, parametri);
        res.json(rezultat.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Greška pri dohvaćanju podataka' });
    }
});

app.get('/api/export/csv',requiresAuth(), async (req, res) => {
    try {
        const { upit, parametri } = napraviUpit(req.query.search, req.query.attribute);
        const rezultat = await baza.query(upit, parametri);
        const csv = new Parser().parse(rezultat.rows);
        res.header('Content-Type', 'text/csv');
        res.attachment('temperatura_podaci.csv');
        res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Greška pri exportu CSV' });
    }
});

app.get('/api/export/json', requiresAuth(),async (req, res) => {
    try {
        const { upit, parametri } = napraviUpit(req.query.search, req.query.attribute);
        const rezultat = await baza.query(upit, parametri);
        const jsonPodaci = uJSONFormat(rezultat.rows);
        res.header('Content-Type', 'application/json');
        res.attachment('temperatura_podaci.json');
        res.json(jsonPodaci);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Greška pri exportu JSON' });
    }
});

const apiOdgovor = (status, poruka, odgovor = null, statusKod = 200) => {
    return {
        status: status,
        message: poruka,
        response: odgovor
    };
};

app.get('/api/v1/temperature',requiresAuth(), async (req, res) => {
    try {
        const rezultat = await baza.query(`
            SELECT m.*, l.naziv as lokacija_naziv, l.vrsta_lokacije, s.naziv as senzor_naziv
            FROM mjerenja m
            JOIN lokacije l ON m.lokacija_id = l.id
            JOIN senzori s ON m.senzor_id = s.id
            ORDER BY m.datum, m.vrijeme
        `);
        
        res.status(200).json(
            apiOdgovor('OK', 'Uspješno dohvaćena sva mjerenja temperature', rezultat.rows)
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            apiOdgovor('Internal Server Error', 'Greška pri dohvaćanju mjerenja', null, 500)
        );
    }
});

app.get('/api/v1/temperature/:id',requiresAuth(), async (req, res) => {
    try {
        const { id } = req.params;
        const rezultat = await baza.query(`
            SELECT m.*, l.naziv as lokacija_naziv, l.vrsta_lokacije, s.naziv as senzor_naziv
            FROM mjerenja m
            JOIN lokacije l ON m.lokacija_id = l.id
            JOIN senzori s ON m.senzor_id = s.id
            WHERE m.id = $1
        `, [id]);
        
        if (rezultat.rows.length === 0) {
            return res.status(404).json(
                apiOdgovor('Not Found', `Mjerenje s ID ${id} nije pronađeno`, null, 404)
            );
        }
        
        res.status(200).json(
            apiOdgovor('OK', `Uspješno dohvaćeno mjerenje s ID ${id}`, rezultat.rows[0])
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            apiOdgovor('Internal Server Error', 'Greška pri dohvaćanju mjerenja', null, 500)
        );
    }
});

app.get('/api/v1/lokacije',requiresAuth(), async (req, res) => {
    try {
        const rezultat = await baza.query('SELECT * FROM lokacije ORDER BY id');
        res.status(200).json(
            apiOdgovor('OK', 'Uspješno dohvaćene sve lokacije', rezultat.rows)
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            apiOdgovor('Internal Server Error', 'Greška pri dohvaćanju lokacija', null, 500)
        );
    }
});

app.get('/api/v1/temperature/lokacija/:lokacijaId',requiresAuth(), async (req, res) => {
    try {
        const { lokacijaId } = req.params;
        const rezultat = await baza.query(`
            SELECT m.*, l.naziv as lokacija_naziv, s.naziv as senzor_naziv
            FROM mjerenja m
            JOIN lokacije l ON m.lokacija_id = l.id
            JOIN senzori s ON m.senzor_id = s.id
            WHERE m.lokacija_id = $1
            ORDER BY m.datum, m.vrijeme
        `, [lokacijaId]);
        
        res.status(200).json(
            apiOdgovor('OK', `Uspješno dohvaćena mjerenja za lokaciju ${lokacijaId}`, rezultat.rows)
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            apiOdgovor('Internal Server Error', 'Greška pri dohvaćanju mjerenja lokacije', null, 500)
        );
    }
});

app.post('/api/v1/temperature',requiresAuth(), async (req, res) => {
    try {
        const { lokacija_id, senzor_id, temperatura, datum, vrijeme } = req.body;
        
        if (!lokacija_id || !senzor_id || temperatura === undefined || !datum || !vrijeme) {
            return res.status(400).json(
                apiOdgovor('Bad Request', 'Nedostaju obavezna polja', null, 400)
            );
        }
        
        if (temperatura < -50 || temperatura > 50) {
            return res.status(400).json(
                apiOdgovor('Bad Request', 'Temperatura mora biti između -50 i 50°C', null, 400)
            );
        }
        
        const rezultat = await baza.query(`
            INSERT INTO mjerenja (lokacija_id, senzor_id, temperatura, datum, vrijeme)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [lokacija_id, senzor_id, temperatura, datum, vrijeme]);
        
        res.status(201).json(
            apiOdgovor('Created', 'Mjerenje uspješno kreirano', rezultat.rows[0], 201)
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            apiOdgovor('Internal Server Error', 'Greška pri kreiranju mjerenja', null, 500)
        );
    }
});

app.put('/api/v1/temperature/:id',requiresAuth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { temperatura, vrijeme } = req.body;
        
        const provjera = await baza.query('SELECT * FROM mjerenja WHERE id = $1', [id]);
        if (provjera.rows.length === 0) {
            return res.status(404).json(
                apiOdgovor('Not Found', `Mjerenje s ID ${id} nije pronađeno`, null, 404)
            );
        }
        
        const updateovi = [];
        const vrijednosti = [];
        let brojParametra = 1;
        
        if (temperatura !== undefined) {
            updateovi.push(`temperatura = $${brojParametra}`);
            vrijednosti.push(temperatura);
            brojParametra++;
        }
        
        if (vrijeme !== undefined) {
            updateovi.push(`vrijeme = $${brojParametra}`);
            vrijednosti.push(vrijeme);
            brojParametra++;
        }
        
        if (updateovi.length === 0) {
            return res.status(400).json(
                apiOdgovor('Bad Request', 'Nisu dostavljena polja za ažuriranje', null, 400)
            );
        }
        
        vrijednosti.push(id);
        const upit = `UPDATE mjerenja SET ${updateovi.join(', ')} WHERE id = $${brojParametra} RETURNING *`;
        
        const rezultat = await baza.query(upit, vrijednosti);
        
        res.status(200).json(
            apiOdgovor('OK', `Mjerenje s ID ${id} uspješno ažurirano`, rezultat.rows[0])
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            apiOdgovor('Internal Server Error', 'Greška pri ažuriranju mjerenja', null, 500)
        );
    }
});

app.delete('/api/v1/temperature/:id', requiresAuth(),async (req, res) => {
    try {
        const { id } = req.params;
        
        const provjera = await baza.query('SELECT * FROM mjerenja WHERE id = $1', [id]);
        if (provjera.rows.length === 0) {
            return res.status(404).json(
                apiOdgovor('Not Found', `Mjerenje s ID ${id} nije pronađeno`, null, 404)
            );
        }
        
        await baza.query('DELETE FROM mjerenja WHERE id = $1', [id]);
        
        res.status(200).json(
            apiOdgovor('OK', `Mjerenje s ID ${id} uspješno obrisano`, null)
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            apiOdgovor('Internal Server Error', 'Greška pri brisanju mjerenja', null, 500)
        );
    }
});

app.get('/api/v1/openapi',requiresAuth(), (req, res) => {
    res.status(200).json(openapiSpec);
});

app.use((req, res) => {
    res.status(404).json(
        apiOdgovor('Not Found', `Endpoint ${req.method} ${req.url} nije pronađen`, null, 404)
    );
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json(
        apiOdgovor('Internal Server Error', 'Došlo je do greške!', null, 500)
    );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});