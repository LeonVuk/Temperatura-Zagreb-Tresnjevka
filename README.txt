Mjerenja temperature - Zagreb Tresnjevka

Podaci sadrže mjerenja temperature prikupljena Sonoff TH Elite senzorom na lokaciji Tresnjevka u Zagrebu. 
Prikupljana su mjerenja u stvarnom vremenu tijekom razdoblja od tri dana.


Metapodaci
Licenca: Creative Commons 4.0 International (CC-by 4.0)
Autor: Leon Vuk
Verzija skupa podataka: 1.0
Jezik podatak: hrvatski
Vremenski period mjerenja: 2025-10-22 do 2025-10-25
Lokacija mjerenja: Zagreb, kvart Tresnjevka
Broj mjerenja: 75
Frekvencija mjerenja: prosječno svakih sat vremena
Nadmorska visina: 125 metara


Opis atributa
CSV format (stupci):
- lokacija (string): Naziv lokacije mjerenja
- nadmorska_visina (integer): Nadmorska visina u metrima
- senzor (string): Naziv i model korištenog senzora
- vrsta_mjerenja (string): Vrsta fizikalne veličine koja se mjeri
- temperatura (decimal): Temperatura u Celzijusima (°C)
- datum (date): Datum mjerenja (YYYY-MM-DD)
- vrijeme (time): Vrijeme mjerenja (HH:MM:SS)
- datum_vrijeme (timestamp): Kombinirani datum i vrijeme


JSON format:
- lokacija (object): 
  id (integer): Identifikator lokacije
  naziv (string): Naziv lokacije
  nadmorska_visina (integer): Nadmorska visina
  
- senzor (object):
  id (integer): Identifikator senzora
  naziv (string): Naziv senzora
  vrsta_mjerenja (string): Vrsta mjerenja (npr. temperatura ili vlažnost)
  
- mjerenja (array): Popis mjerenja
  temperatura (decimal): Izmjerena temperatura
  datum (date): Datum mjerenja
  vrijeme (time): Vrijeme mjerenja
  datum_vrijeme (timestamp):Datum i vrijeme mjerenja


Struktura podataka
 1 lokacija (Zagreb-Tresnjevka)
 1 senzor (Sonoff TH Elite 1)
 Više mjerenja (75 mjerenja)


Primjena
 Analiza dnevnih temperaturnih varijacija
 Proučavanje kretanja temperature kroz dane ili duži period


Tehnički detalji
 Baza podataka: PostgreSQL
 Formati eksporta: CSV i JSON


Licence
Ovaj skup podataka dostupan je pod:
 [Creative Commons Attribution 4.0 International licencom](https://creativecommons.org/licenses/by/4.0/).
