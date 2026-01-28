const request = require('supertest');
const express = require('express');

jest.mock('../controllers/vehicle.controller', () => ({
  getAllVehicles: jest.fn((req, res) => res.status(200).json([])),
  createVehicle: jest.fn((req, res) => res.status(201).json({ message: 'Created' })),
  updateVehicle: jest.fn((req, res) => res.status(200).json({ message: 'Updated' })),
  deleteVehicle: jest.fn((req, res) => res.status(200).json({ message: 'Deleted' }))
}));

jest.mock('../middleware/authJwt', () => ({
  verifyToken: (req, res, next) => next()
}));


const vehicleRoutes = require('../routes/vehicle.routes');
const VehicleController = require('../controllers/vehicle.controller');

const app = express();
app.use(express.json());
app.use('/api/vehicles', vehicleRoutes);

describe('Vehicle Routes (Faked)', () => {

  it('GET /api/vehicles - should return fake list', async () => {
    VehicleController.getAllVehicles.mockImplementation((req, res) => 
      res.status(200).json([{ id: 99, make: 'Fake-Toyota' }])
    );

    const res = await request(app).get('/api/vehicles');
    
    expect(res.statusCode).toBe(200);
    expect(res.body[0].make).toBe('Fake-Toyota');
  });

  it('PUT /api/vehicles/:id - should return fake success', async () => {
    const res = await request(app)
      .put('/api/vehicles/1')
      .send({ make: 'Honda' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Updated');
  });

  it('DELETE /api/vehicles/:id - should return fake success', async () => {
    const res = await request(app).delete('/api/vehicles/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Deleted');
  });
});