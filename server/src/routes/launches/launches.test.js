const request = require('supertest');
const app = require('../../app.js');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {


    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    describe('Test GET /launches', () => {
        test('It should respond with 200 success', async () => {
            //const response = await request(app).get('/launches');
            //expect(response.statusCode).toBe(200);
    
            const response = await request(app)
                .get('/launches')
                .expect('Content-Type', /json/)
                .expect(200);
    
        })
    })

    describe('Test POST /launch', () => {

        const completeLaunchData = {
            "mission": "CATE123",
            "rocket": "CATE Experimental IS1",
            "target": "Kepler-62 f",
            "launchDate": "Nov 6, 2030"
        };
    
        const launchDataWithoutDate = {
            "mission": "CATE123",
            "rocket": "CATE Experimental IS1",
            "target": "Kepler-62 f",
        }
    
        const launchaDataWithInvalideDate = {
            "mission": "CATE123",
            "rocket": "CATE Experimental IS1",
            "target": "Kepler-62 f",
            "launchDate": "Not a Date"
        }
    
    
        test('It should respond with 201 created', async () => {
            const response = await request(app)
                .post('/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
    
            expect(responseDate).toBe(requestDate);
    
    
            //console.log(response.body)
            //console.log(launchDataWithoutDate)
    
            expect(response.body).toMatchObject(launchDataWithoutDate)
        })
        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Missin required launch property'
            });
    
        })
        test('It should catch invalid dates', async () => {
                const response = await request(app)
                    .post('/launches')
                    .send(launchaDataWithInvalideDate)
                    .expect('Content-Type', /json/)
                    .expect(400);
    
                expect(response.body).toStrictEqual({
                    error: 'Invalid launch Date'
                });
    
        })
    })




})



