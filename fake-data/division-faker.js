import { faker } from '@faker-js/faker';

export function divisionValidFaker() {

    const divisionName = faker.company.name();
    const chief = faker.person.firstName().trim().slice(0, 2);
    const acronym = divisionName.split(' ').map(word => word[0]).join('').toUpperCase();

    return {
        divisionName,
        chief,
        acronym
    };
}

export function divisionInvalidFaker() {

    const specialChars = '~!@#$%^&*()_+{}|:"<>?`[];/=1234567890-.,';
    const invalidInput = faker.string.fromCharacters(specialChars, { min: 3, max: 10 })
    const chief = faker.person.firstName().trim().slice(0, 2);

    return {
        invalidInput,
        chief, 
        divisionName
    }
}

export function editDivisionValidFaker() {

    const divisionName = faker.company.name();
    const chief = faker.person.firstName().trim().slice(0, 2);
    const acronym = divisionName.split(' ').map(word => word[0]).join('').toUpperCase();

    return {
        divisionName,
        chief,
        acronym
    };
}