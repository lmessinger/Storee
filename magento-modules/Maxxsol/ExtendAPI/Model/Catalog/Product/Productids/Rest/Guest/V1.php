<?php

class Maxxsol_ExtendAPI_Model_Catalog_Product_ProductIds_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Catalog_Product_ProductIds {

    /**
     * Retrieve list of category list.
     *
     * @return array
     */
    protected function _retrieveCollection() {
        $cat_id = intval($this->getRequest()->getParam('cat_id'));
        $offset = intval($this->getRequest()->getParam('offset'));
        $orderby = $this->getRequest()->getParam('orderby'); //coma separated fields e.g price,created_at
        $order = $this->getRequest()->getParam('order'); //ASC or DESC
        $limit = intval($this->getRequest()->getParam('limit'));

        $orderby = explode(',', $orderby);
        $orderby = array_filter($orderby);
        
        if(count($orderby) == 0){
            $orderby[] = 'created_at';
        }

        if (strcasecmp($order, 'desc') != 0 || strcasecmp($order, 'asc') != 0) {
            $order = 'desc';
        }

        $productIds = $this->getProductIdsByCategory($cat_id, $offset, $orderby, $order, $limit);

        return $productIds;
    }

}
