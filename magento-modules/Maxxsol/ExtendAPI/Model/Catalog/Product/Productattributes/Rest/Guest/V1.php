<?php

class Maxxsol_ExtendAPI_Model_Catalog_Product_ProductAttributes_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Catalog_Product_ProductAttributes {

    /**
     * Retrieve list of Product Attributes.
     *
     * @return array
     */
    protected function _retrieveCollection() {
        $prod_id = intval($this->getRequest()->getParam('prod_id'));
        $include = explode(',', $this->getRequest()->getParam('include'));
        $exclude = explode(',', $this->getRequest()->getParam('exclude'));
        
        $include = array_filter($include);
        $exclude = array_filter($exclude);
        
        $attributes = $this->getProductAttributes($prod_id, $include, $exclude);

        return $attributes;
    }

}
