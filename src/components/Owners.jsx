import React from 'react';

function Owners() {
    // Mock data based on schema: owner_id, first_name, last_name, contact_number, email, address, created_at
    const owners = [
        {
            owner_id: 1,
            first_name: 'Juan',
            last_name: 'Dela Cruz',
            contact_number: '09171234567',
            email: 'juan@example.com',
            address: '123 Rizal St, Manila',
            created_at: '2023-01-15 08:30:00'
        },
        {
            owner_id: 2,
            first_name: 'Maria',
            last_name: 'Santos',
            contact_number: '09189876543',
            email: 'maria@example.com',
            address: '456 Quezon Ave, Quezon City',
            created_at: '2023-02-20 14:15:00'
        },
        {
            owner_id: 3,
            first_name: 'Pedro',
            last_name: 'Penduko',
            contact_number: '09223334444',
            email: 'pedro@example.com',
            address: '789 Mabini St, Pasig',
            created_at: '2023-03-10 11:45:00'
        },
        {
            owner_id: 4,
            first_name: 'Ana',
            last_name: 'Reyes',
            contact_number: '09175556666',
            email: 'ana@example.com',
            address: '101 Bonifacio High St, Taguig',
            created_at: '2023-04-05 09:20:00'
        },
        {
            owner_id: 5,
            first_name: 'Jose',
            last_name: 'Manalo',
            contact_number: '09998887777',
            email: 'jose@example.com',
            address: '202 Aguinaldo Hwy, Cavite',
            created_at: '2023-05-12 16:50:00'
        },
    ];

    return (
        <div className="car-listings-container">
            <h2>Owners</h2>
            <div className="table-responsive">
                <table className="car-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Contact Number</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {owners.map((owner) => (
                            <tr key={owner.owner_id}>
                                <td>{owner.owner_id}</td>
                                <td>{owner.first_name} {owner.last_name}</td>
                                <td>{owner.contact_number}</td>
                                <td>{owner.email}</td>
                                <td>{owner.address}</td>
                                <td>{owner.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Owners;
