<?php

/**
 * Description of Maxxsol_ExtendAPI_Model_Catalog_Product_Options
 *
 * @author Jalal
 */
class Maxxsol_ExtendAPI_Model_Catalog_Product_Options extends Maxxsol_ExtendAPI_Model_Catalog_Product {
    
    public function _retrieveCollection() {
        $prod_id = intval($this->getRequest()->getParam('prod_id'));
        
        return $this->_getProductOptions($prod_id);
    }
}
