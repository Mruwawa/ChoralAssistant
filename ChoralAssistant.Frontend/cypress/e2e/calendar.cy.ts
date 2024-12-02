describe('template spec', () => {
    it('calendar should switch months and years', () => {
  
      cy.intercept('GET', '/api/user/user-info', {
        statusCode: 200,
        body: {
          "isAuthorized": true,
          "userId": "test",
          "userName": "Filip Murawski",
          "userPhotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocJ8k6ENQ8HClmeHk3TeODNs7H9WMFMjPl4jMRM8JR5q8Sf47Q=s96-c"
        }
      }).as('loginRequest');
  
      let startDate = new Date();
      let endDate = new Date();
      endDate.setHours(endDate.getHours() + 1);
  
      cy.intercept('GET', `/api/calendar*}`, {
        statusCode: 200,
        body: []
      }).as('eventsRequest');
  
      cy.visit('/kalendarz');
  
      let currentMonth = new Date().getMonth();
      let currentYear = new Date().getFullYear();
      let monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
      let currentMonthName = monthNames[currentMonth];
  
      cy.contains('Kalendarz');
      cy.contains(currentMonthName);
      cy.contains(currentYear);
  
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      currentMonthName = monthNames[currentMonth];
  
      cy.get('button').contains('arrow_right').click();
  
      cy.contains(currentMonthName);
      cy.contains(currentYear);
 
  
    });

    it('calendar should display events', () => {
  
        cy.intercept('GET', '/api/user/user-info', {
          statusCode: 200,
          body: {
            "isAuthorized": true,
            "userId": "test",
            "userName": "Filip Murawski",
            "userPhotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocJ8k6ENQ8HClmeHk3TeODNs7H9WMFMjPl4jMRM8JR5q8Sf47Q=s96-c"
          }
        }).as('loginRequest');
    
        let startDate = new Date();
        let endDate = new Date();
        endDate.setHours(endDate.getHours() + 1);
    
        cy.intercept('GET', `/api/calendar*`, {
          statusCode: 200,
          body: [{
            "title": "Próba",
            "description": null,
            "start": startDate.toISOString(),
            "end": endDate.toISOString(),
            "location": null,
            "pieces": [
              {
                "id": 5,
                "title": "Msza Schuberta"
              }
            ],
            "id": "87kgnj4iqqeomudju0qkciulqc"
          }]
        }).as('eventsRequest');
    
        cy.visit('/kalendarz');

        cy.wait('@eventsRequest');

        cy.contains('Próba');  
    
      });
  })