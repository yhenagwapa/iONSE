import { faker } from '@faker-js/faker';

export function sectionUnitValidFaker() {

    const officeName = faker.company.name();
    const officeHead = faker.person.firstName().trim().slice(0, 2);
    const acronym = officeName.split(' ').map(word => word[0]).join('').toUpperCase();
    
    const division = faker.helpers.arrayElement([
        "AD",
        "All-XI",
        "DRMD",
        "FMD",
        "HRMDD",
        "ORD",
        "4PS-CBS",
        "PPD",
        "PROMSD",
        "PSD"
    ]);

    return {
        officeName,
        officeHead,
        acronym,
        division
    };
}

export function sectionUnitInvalidFaker() {

    const specialChars = '~!@#$%^&*()_+{}|:"<>?`[];/=1234567890-.,';
    const invalidInput = faker.string.fromCharacters(specialChars, { min: 3, max: 10 })
    const officeHead = faker.person.firstName().trim().slice(0, 2);

    const division = faker.helpers.arrayElement([
        "AD",
        "All-XI",
        "DRMD",
        "FMD",
        "HRMDD",
        "ORD",
        "4PS-CBS",
        "PPD",
        "PROMSD",
        "PSD"
    ]);

    return {
        invalidInput,
        officeHead, 
        division
    }
}

export function editSectionUnitValidFaker() {

    const officeName = faker.company.name();
    const officeHead = faker.person.firstName().trim().slice(0, 2);
    const acronym = officeName.split(' ').map(word => word[0]).join('').toUpperCase();
    
    const division = faker.helpers.arrayElement([
        "AD",
        "All-XI",
        "DRMD",
        "FMD",
        "HRMDD",
        "ORD",
        "4PS-CBS",
        "PPD",
        "PROMSD",
        "PSD"
    ]);

    return {
        officeName,
        officeHead,
        acronym,
        division
    };
}