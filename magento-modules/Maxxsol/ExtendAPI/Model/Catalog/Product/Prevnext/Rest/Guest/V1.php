<?php

class Maxxsol_ExtendAPI_Model_Catalog_Product_PrevNext_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Catalog_Product_PrevNext {

    /**
     * Retrieve list of category list.
     *
     * @return array
     */
    protected function _retrieveCollection() {
        $cat_id = intval($this->getRequest()->getParam('cat_id'));
        $prod_id = intval($this->getRequest()->getParam('prod_id'));
        $rank = intval($this->getRequest()->getParam('rank'));
        $orderby = $this->getRequest()->getParam('orderby'); //coma separated fields e.g price,created_at
        $order = $this->getRequest()->getParam('order'); //ASC or DESC
        $prevNext = strtolower($this->getRequest()->getParam('prevnext')); //Retrieve only next items with current product
        $limit = intval($this->getRequest()->getParam('limit'));

        $prevNext = !in_array($prevNext, array('prevnext', 'next', 'prev')) ? 'prevnext' : $prevNext;

        $orderby = explode(',', $orderby);
        $orderby = array_filter($orderby);

        if (count($orderby) == 0) {
            $orderby[] = 'created_at';
        }

        if (strcasecmp($order, 'desc') != 0 || strcasecmp($order, 'asc') != 0) {
            $order = 'desc';
        }

        $prevNextProducts = $this->getPrevNextOfProduct($cat_id, $prod_id, $rank, $orderby, $order, $prevNext, $limit);

        return $prevNextProducts;
    }

}
