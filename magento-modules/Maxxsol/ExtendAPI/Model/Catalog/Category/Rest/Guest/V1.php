<?php

class Maxxsol_ExtendAPI_Model_Catalog_Category_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Catalog_Category {

    /**
     * Retrieve list of category list.
     *
     * @return array
     */
    protected function _retrieveCollection() {
        $cat_id = $this->getRequest()->getParam('cat_id');
        
        $offset = $this->getRequest()->getParam('offset');
        $limit = $this->getRequest()->getParam('limit');
        
        $rootCatId = Mage::app()->getStore()->getRootCategoryId();

        $cat_id = empty($cat_id) ? $rootCatId : $cat_id;
        $allActiveCats = $this->getTreeCategories($cat_id, $offset, $limit);

        return $allActiveCats;
    }

}