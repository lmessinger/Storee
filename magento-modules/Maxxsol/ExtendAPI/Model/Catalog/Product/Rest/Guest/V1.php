<?php

class Maxxsol_ExtendAPI_Model_Catalog_Product_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Catalog_Product {

    /**
     * Retrieve list of category list.
     *
     * @return array
     */
    protected function _retrieve() {
        $prod_id = intval($this->getRequest()->getParam('prod_id'));

        $productData = $this->_getProduct($prod_id);

        return $productData;
    }

}
