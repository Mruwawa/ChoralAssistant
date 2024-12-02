describe('template spec', () => {
  it('should load the homepage', () => {

    cy.intercept('GET', '/api/user/user-info', {
      statusCode: 200,
      body: {
        "isAuthorized": true,
        "userId": "test",
        "userName": "Filip Murawski",
        "userPhotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocJ8k6ENQ8HClmeHk3TeODNs7H9WMFMjPl4jMRM8JR5q8Sf47Q=s96-c"
      }
    }).as('loginRequest');

    cy.visit('/');

    cy.contains('Witaj w asystencie chórzysty');
  });
})