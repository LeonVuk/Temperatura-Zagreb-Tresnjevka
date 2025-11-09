const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { Parser } = require('json2csv');

const app = express();
app.use(cors());
app.use(express.json());

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

app.get('/api/temperature', async (req, res) => {
    try {
        const { upit, parametri } = napraviUpit(req.query.search, req.query.attribute);
        const rezultat = await baza.query(upit, parametri);
        res.json(rezultat.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Greška pri dohvaćanju podataka' });
    }
});

app.get('/api/export/csv', async (req, res) => {
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

app.get('/api/export/json', async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});