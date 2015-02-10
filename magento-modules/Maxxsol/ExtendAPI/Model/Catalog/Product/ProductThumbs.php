<?php

/**
 * Description of ProductThumbs
 *
 * @author Makki
 */
class Maxxsol_ExtendAPI_Model_Catalog_Product_ProductThumbs extends Mage_Api2_Model_Resource {

    /**
     * 
     * @param integer $prod_id
     * @return array
     */
    function getProductThumbs($prod_id, $width, $height) {

        $product = Mage::getModel('catalog/product')->load($prod_id);
        $galleryImages = $product->getMediaGalleryImages();
        
        $productThumbs = array();

        try {
            foreach ($galleryImages as $image) {
                $origImgUrl = (string)Mage::helper('catalog/image')->init($product,
                        'image', $image->getFile());
                $thumbUrl = (string)Mage::helper('catalog/image')->init($product,
                                'thumbnail', $image->getFile())->resize($width, $height);
                
                $productThumbs[] = array(
                    'id' => $image->getId(),
                    'original_image' => $origImgUrl,
                    'thumb_url' => $thumbUrl
                );
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
        }
        
        return $productThumbs;
    }

}
