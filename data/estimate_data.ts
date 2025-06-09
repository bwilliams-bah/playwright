import { fa, faker } from '@faker-js/faker';

const user = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
    country: faker.location.country(),
   
}

const estimate_data = {
    mission_type: ['Operation', 'Exercise', 'Redeployment', 'Deployment', 
        'Sustainment', 'Distribution Channel', 'Daily Movement'],
    origin_country: faker.location.country(),
    origin_territory: faker.location.continent(),
    drop_off_country: faker.location.country(),
    drop_off_territory: faker.location.continent(),

}

const estimate_data1 = {
    mission_type: ['Operation', 'Exercise', 'Redeployment', 'Deployment', 
        'Sustainment', 'Distribution Channel', 'Daily Movement'],
    origin_country: faker.location.country(),
    origin_territory: faker.location.continent(),
    drop_off_country: faker.location.country(),
    drop_off_territory: faker.location.continent(),

}
export { user, estimate_data };
