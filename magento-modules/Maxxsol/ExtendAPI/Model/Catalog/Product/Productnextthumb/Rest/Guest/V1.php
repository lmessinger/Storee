<?php

class Maxxsol_ExtendAPI_Model_Catalog_Product_ProductNextThumb_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Catalog_Product_ProductNextThumb {

    /**
     * Retrieve list of category list.
     *
     * @return array
     */
    protected function _retrieveCollection() {
        $cat_id = intval($this->getRequest()->getParam('cat_id'));
        $prod_id = intval($this->getRequest()->getParam('prod_id'));
        $limit = intval($this->getRequest()->getParam('limit'));

        $productThumbs = $this->getProductNextThumbByCategory($cat_id, $prod_id,$limit);

        return $productThumbs;
    }

}