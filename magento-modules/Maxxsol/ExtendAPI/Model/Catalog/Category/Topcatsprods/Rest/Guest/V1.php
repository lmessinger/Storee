<?php

class Maxxsol_ExtendAPI_Model_Catalog_Category_TopCatsProds_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Catalog_Category_TopCatsProds {

    /**
     * Retrieve list of category list.
     *
     * @return array
     */
    protected function _retrieveCollection() {
        return $this->getAllCategoriesWithProducts();
    }

}