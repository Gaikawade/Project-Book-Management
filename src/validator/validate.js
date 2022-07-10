const isValidBody = (body) => {
    return Object.keys(body).length > 0;
};

const isValidTitle = (title) => {
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1;
};

const isValidName = (name) => {
    regex = /^[a-zA-Z -]{2,30}$/;
    return regex.test(name);
};

const isValidMobile = (mobile) => {
    let regex = /^[6-9]\d{9}$/;
    return regex.test(mobile);
};

const isValidEmail = (email) => {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
};

const isValidPassword = (password) => {
    return (/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,15}$/.test(password));
};

let isbnRegex = (ISBN) => {
    return (/^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/.test(ISBN.trim()));
};

const isValidFormat = (value) => {
    return (/^[A-Z0-9][-'_\sa-zA-Z0-9]+$/.test(value));
}

const isValidDate = (date) => {
    return (/^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(date));
}

module.exports = {
    isValidBody,
    isValidTitle,
    isValidName,
    isValidMobile,
    isValidEmail,
    isValidPassword,
    isbnRegex,
    isValidFormat,
    isValidDate
};

// name = name.replace(/\s\s+/g, ' ');     //removing spaces between first and last name
// data['name'] = name;
