const parse = require('csv-parse');
const fs = require('fs');
const path = require('path');


const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED' &&
        planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 &&
        planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    savePlanets(data);
                }
            })
            .on('error', (err) => {
                console.log(`This is the error for you: ${err}`);
                reject(err);
            })
            .on('end', async () => {
                const countPlanetsFound = (await getAllPlanets()).length;
                console.log(`${countPlanetsFound} habitable planets found!`);
                resolve();
            });
    });
}

async function savePlanets(planet) {

    try{
        await planets.updateOne({
            keplerName: planet.kepler_name
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true
        });
    } catch (err) {
        console.error(`Could not save the planet ${err}`);
    }


}

async function getAllPlanets() {
    //return habitablePlanet;
    return await planets.find({}, {
        '_id': 0, '__v': 0
    });
}




module.exports = {
    loadPlanetsData,
    getAllPlanets
}