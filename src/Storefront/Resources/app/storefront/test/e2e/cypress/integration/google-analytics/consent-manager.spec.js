describe('Google Analytics: New analytics cookie in Cookie Consent Manager', () => {
    it('@cookies: There is a new analytics cookie in the manager', () => {
        cy.visit('/');

        cy.window().then((win) => {
            win.PluginManager.getPluginInstances('CookieConfiguration')[0].openOffCanvas();
            cy.get('.offcanvas-cookie').should('be.visible').then(() => {
                cy.get('.offcanvas-cookie').find('.offcanvas-cookie-group').should('have.length', 2);
                cy.get('.offcanvas-cookie-group').eq(1).contains('Statistic');

                cy.get('.offcanvas-cookie-group').eq(1).find('.offcanvas-cookie-entry').contains('Google Analytics');
            });
        });
    });

    it('@cookies: Google Analytics cookies will be set and removed again', () => {
        cy.addAnalyticsFixtureToSalesChannel();
        cy.server();
        cy.route({
            url: '/cookie/offcanvas',
            method: 'get'
        }).as('cookieOffcanvas');

        cy.visit('/');
        cy.window().then((win) => {
            cy.getCookie('_swag_ga_ga').should('be.null');

            cy.wait('@cookieOffcanvas').then((xhr) => {
                expect(xhr).to.have.property('status', 200);
                cy.get('.offcanvas-cookie').should('be.visible');
                cy.get('.offcanvas-cookie-group').eq(1).find('.custom-control-label').first().click();
                cy.get('.js-offcanvas-cookie-submit').click();

                cy.waitUntil(() => cy.getCookie('_swag_ga_ga').then(cookie => cookie && cookie.value !== null));
                cy.get('.offcanvas-cookie').should('not.exist').then(() => {
                    win.PluginManager.getPluginInstances('CookieConfiguration')[0].openOffCanvas();
                    cy.get('.offcanvas-cookie').should('be.visible').then(() => {
                        cy.get('.offcanvas-cookie-group').eq(1).find('.custom-control-label').first().click();
                        cy.get('.js-offcanvas-cookie-submit').click();

                        cy.waitUntil(() => cy.getCookie('_swag_ga_ga').then(cookie => !cookie || cookie.value === null));
                    });
                });
            });

            win.PluginManager.getPluginInstances('CookieConfiguration')[0].openOffCanvas();
        });
    });
});
