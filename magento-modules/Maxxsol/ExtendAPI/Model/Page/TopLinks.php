<?php

/**
 * Description of Maxxsol_ExtendAPI_Model_Catalog_Category
 *
 * @author Makki
 */
class Maxxsol_ExtendAPI_Model_Page_TopLinks extends Mage_Api2_Model_Resource {

    function _getTopLinks() {
        $links = array();

        $app = Mage::app('default');
        $app->getTranslator()->init('frontend');

//        $wishlistLinksBlock = $app->getLayout()->getBlockSingleton('wishlist/links');

        $links[] = array(
            'title' => 'My Account',
            'address' => Mage::helper('customer')->getAccountUrl()
        );
        $links[] = array(
            'title' => 'Bag',
            'address' => Mage::helper('checkout/cart')->getCartUrl()
        );
        $links[] = array(
            'title' => 'Wishlist',
            'address' => Mage::helper('wishlist')->getListUrl()
        );

        return $links;
    }

}
