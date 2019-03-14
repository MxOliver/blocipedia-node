'use strict';

const faker = require("faker");
const User = require("../models").User;
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      email: faker.internet.email(),
      password: bcrypt.hashSync('purple', 7),
      role: faker.random.number(1),
      createdAt: new Date(),
      updatedAt: new Date(),
      id: faker.random.number({min:5, max:15}),
      name: faker.name.firstName()
    }], {});

    const user = await User.findOne({where: {role: 0}});

    let wikis = [];

    for(let i = 1; i <= 7; i++){
      wikis.push({
        title: faker.lorem.words(),
        body: faker.lorem.slug(),
        private: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.id,
      });
    }

    return await queryInterface.bulkInsert('Wikis', wikis, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Wikis', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
