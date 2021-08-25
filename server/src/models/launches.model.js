const launchesDatabase = require('./launches.mongo');
const planetsDatabase = require('./planets.mongo');
const launches = new Map();
const defaultFlightNumber = 100;


const launch = {
    flightNumber: 100,
    mission: 'Kepler exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers: ['NASA', 'ZTM'],
    upcoming: true,
    success: true,
}

saveLaunch(launch);

launches.set(launch.flightNumber, launch);

async function existsLaunchWithId(launchId) {
    return await launchesDatabase.findOne({
        flightNumber: launchId
    });

}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return defaultFlightNumber;
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches() {
    //return Array.from(launches.values());
    return await launchesDatabase
        .find({}, {
            '_id': 0,
            '__v': 0
        });
}

async function saveLaunch(launch) {

    const planet = await planetsDatabase.findOne({
        keplerName: launch.target
    });

    if (!planet) {
        throw new Error('No matching planet found');
    }
    await launchesDatabase.findOneAndUpdate({
            flightNumber: launch.flightNumber,
        },
        launch, {
            upsert: true
        })
}

// function addNewLaunch(launch) {
//     latestFlightNumber++;
//     launches.set(latestFlightNumber, Object.assign(launch, {
//         flightNumber: latestFlightNumber,
//         customers: ['ZTM', 'NASA'],
//         upcoming: true,
//         success: true
//     }));
// }

async function scheduleNewLaunch(launch) {


    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch)



}

async function abortLaunchById(launchId) {

    const aborted =  await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false
    })

    return aborted.ok === 1 && aborted.nModified === 1;

}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById
}