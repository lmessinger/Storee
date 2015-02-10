<?php

class Maxxsol_ExtendAPI_Model_Page_TopLinks_Rest_Guest_V1 extends Maxxsol_ExtendAPI_Model_Page_TopLinks {

    protected function _retrieveCollection(){
        return $this->_getTopLinks();
    }

}