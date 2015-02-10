<?php

class Maxxsol_StoryPlugin_Model_Catalog_Product_Observer extends Varien_Event_Observer {

    public function __construct() {
        parent::__construct();
    }

    public function runGruntForNewProduct($observer) {
        $event = $observer->getEvent();
        $product = $event->getProduct();
        $pluginDir = Mage::getModuleDir('', 'Maxxsol_StoryPlugin');
        $filePath = $pluginDir . '/scripts/' . Mage::getStoreConfig('general/story_client/grunt_script_new_product');


        if ($product->isObjectNew()) {
            //Operations for new product added
            if (file_exists($filePath)) {
                shell_exec('sh ' . $filePath);
            }
        } else {
            //Operations for old product
        }
    }

    public function redirectToClient($observer) {
        $event = $observer->getEvent();
        $product = $event->getProduct();
        $productData = $product->getData();

        $client_baseUrl = Mage::getStoreConfig('general/story_client/client_baseurl');

        Mage::app()
                ->getResponse()
                ->setRedirect($client_baseUrl . '#/productdetails/' . $productData['entity_id'] . '/' . $productData['url_key']);

        Mage::app()
                ->getResponse()
                ->sendResponse();

        exit;
    }

}
