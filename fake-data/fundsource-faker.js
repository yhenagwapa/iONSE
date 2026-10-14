import { faker } from '@faker-js/faker';

export function fundSourceValidFaker() {

    const papcode = faker.string.numeric(15);
    const fundsourceName = faker.lorem.sentence().trim().slice(0, 30);

    return {
        papcode,
        fundsourceName
    };
}

export function fundSourceInvalidFaker() {

    const specialChars = '~!@#$%^&*()_+{}|:"<>?`[];/=1234567890-.,';
    const invalidInput = faker.string.fromCharacters(specialChars, { min: 3, max: 10 })

    return {
        invalidInput
    }
}

export function editFundSourceValidFaker() {

    const papcode = faker.string.numeric(15);
    const fundsourceName = faker.lorem.sentence().trim().slice(0, 30);

    return {
        papcode,
        fundsourceName
    };
}