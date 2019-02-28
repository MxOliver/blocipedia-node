'use strict';

const faker = require("faker");

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.bulkInsert('Wikis', [{
     title: faker.hacker.phrase(),
     body: faker.lorem.sentence(),
     private: false,
     createdAt: faker.date.recent(),
     updatedAt: faker.date.recent(),
     userId: 1
   }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Wikis', null, {});
  }
};
