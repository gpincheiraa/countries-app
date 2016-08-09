(function() {
  'use strict';
  
  describe('Home Controller', HomeControllerDescription);

  function HomeControllerDescription(){

    //////////////  GLOBALS   ////////////////////////////////
    var HomeController;
    //////////////  BEFORE EACH ////////////////////////////////
    beforeEach(module('CountriesApp'));

    beforeEach(inject(eachSpec));
    function eachSpec($rootScope, $controller){
      HomeController = $controller('HomeController');  
    }

    //////////////////   SPECS //////////////////////////////////
    it('1. Debería estar definido', spec1);

    function spec1() {
      expect(HomeController).toBeDefined();
    }
  }

})();