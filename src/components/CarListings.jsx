import React from 'react';

function CarListings() {
    // Mock data as backend connection is not yet available
    const cars = [
        { id: 1, body_type: 'Sedan', color: 'Black', engine_type: 'V6', license_plate: 'ABC-123', make: 'Toyota', model: 'Camry', year: 2022, transmission: 'Automatic' },
        { id: 2, body_type: 'SUV', color: 'White', engine_type: 'V8', license_plate: 'XYZ-789', make: 'Ford', model: 'Explorer', year: 2021, transmission: 'Automatic' },
        { id: 3, body_type: 'Hatchback', color: 'Red', engine_type: 'Inline-4', license_plate: 'LMN-456', make: 'Honda', model: 'Civic', year: 2023, transmission: 'CVT' },
        { id: 4, body_type: 'Coupe', color: 'Blue', engine_type: 'V6', license_plate: 'QWE-999', make: 'Nissan', model: '370Z', year: 2020, transmission: 'Manual' },
        { id: 5, body_type: 'Truck', color: 'Silver', engine_type: 'V8', license_plate: 'ASD-777', make: 'Chevrolet', model: 'Silverado', year: 2022, transmission: 'Automatic' },
    ];

    return (
        <div className="car-listings-container">
            <h2>Car Listings</h2>
            <div className="table-responsive">
                <table className="car-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Year</th>
                            <th>Body Type</th>
                            <th>Color</th>
                            <th>Engine</th>
                            <th>Transmission</th>
                            <th>License Plate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map((car) => (
                            <tr key={car.id}>
                                <td>{car.id}</td>
                                <td>{car.make}</td>
                                <td>{car.model}</td>
                                <td>{car.year}</td>
                                <td>{car.body_type}</td>
                                <td>{car.color}</td>
                                <td>{car.engine_type}</td>
                                <td>{car.transmission}</td>
                                <td>{car.license_plate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CarListings;
