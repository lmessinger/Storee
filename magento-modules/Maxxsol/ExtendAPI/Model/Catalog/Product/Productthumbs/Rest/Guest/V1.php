<?php

class Maxxsol_ExtendAPI_Model_Catalog_Product_ProductThumbs_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Catalog_Product_ProductThumbs {

    /**
     * Retrieve list of category list.
     *
     * @return array
     */
    protected function _retrieveCollection() {
        $prod_id = intval($this->getRequest()->getParam('prod_id'));
        $width = intval($this->getRequest()->getParam('width'));
        $height = intval($this->getRequest()->getParam('height'));

        $productThumbs = $this->getProductThumbs($prod_id, $width, $height);
        return $productThumbs;
    }

}
