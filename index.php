<?php

/**
 * Plugin Name: Product Reorder for Woocommerce
 * Description: Product Reorder Plugin that allow you to reorder the products in woocommerce shop page.
 * Author: Gangesh Matta
 * Version:1.2.5
 * Requires at least: 4.8
 * Tested up to: 5.9
 * Text Domain: wpr-reorder
 * Domain Path: /languages/
 * Author URI: https://profiles.wordpress.org/gangesh/
 */



add_action('admin_enqueue_scripts', 'wpr_reorder_enqueue');
add_action( 'init', 'wpr_rest_api_featured_images_init', 12 );


function wpr_reorder_enqueue()
{
    $ver = "1.2.5";
    $screen = get_current_screen();

    if($screen->id == "product_page_wpr-reorder") {
        wp_enqueue_style('wpr-style2', plugin_dir_url(__FILE__) . 'css/style.css', "", $ver);
        // Use `get_stylesheet_directory_uri() if your script is inside your theme or child theme.
        wp_enqueue_script('jquery-ui-sortable');
        wp_enqueue_script('reorder-pro4', plugin_dir_url(__FILE__) . 'js/index.js', array('jquery-ui-core'), $ver, true);

        $rest_data = array(
            'wp_rest_url' => get_rest_url(),
            'wp_rest' => wp_create_nonce( 'wp_rest' ) ,
            'placeholder' => wc_placeholder_img_src("thumbnail"),
            'woo_currency' => get_woocommerce_currency_symbol()
        );
        wp_localize_script( 'reorder-pro4', 'wpr', $rest_data );
    }

}

function wpr_rest_api_featured_images_init() {

    if ( function_exists( 'register_rest_field' ) ) {
        register_rest_field( "product",
            'wpr_featured_image',
            array(
                'get_callback' => 'wpr_rest_api_featured_images_get_field',
                'schema'       => null,
            )
        );
    }

}

function wpr_rest_api_featured_images_get_field( $object, $field_name, $request ) {

    $post_id = $object['id'];
    $post_meta = get_post_meta( $post_id );
    $post_image = get_post_thumbnail_id( $post_id );
    $featured_image = wp_get_attachment_image_src($post_image, "thumbnail") ?? wp_get_attachment_image_src($post_image, "thumbnail")[0];
    return apply_filters( 'wpr_rest_api_featured_image', $featured_image, $post_id );
}


//product categories

// Draw the menu page itself
function wpr_reorder_do_page()
{
    ?>

    <div class="wrap">
        <div class="fixed-holder">
            <h1 class="reorder-title"><?php esc_html_e('WooCommerce Product Re-order', 'wpr-reorder');?>
                <small> Simply Re-order products</small>
            </h1>
        </div>

        <div id="wpr-api">
            <div id="wpr-action-bar">
                <div class="filter-wrap">
                    <span class="label"><?php _e("Filter by", "wpr-reorder"); ?></span>
                    <span id="wpr-filter-type-wrap">
                    <select id="wpr-filter-type">
                        <option value="none">None</option>
                        <option value="category">Catgories</option>
                        <option value="tag">Tags</option>
                    </select>
                </span>
                    <span id="wpr-categories-wrap" style="display:none">
                <select id="wpr-categories" onchange="search_wpr_list(this)">
                        <option value="all">All Categories</option>
                    </select>
                </span>
                    <span id="wpr-tags-wrap" style="display:none">
                <select id="wpr-tags" onchange="search_wpr_tag_list(this)">
                        <option value="all">All Tags</option>

                    </select>
                </span>
                    <span id="wpr-filter-reset"> <button class="button" id="wpr-reset-filters">Reset</button> </span>
                </div>
                <div id="wpr-loader">Products Loading...</div>
                <div class="save-action"> <button
                            id="save_order" class="button button-primary"><?php esc_html_e('Save order', 'wpr-reorder')?></button> </div>
            </div>
            <div id="wpr-status"></div>
            <ul id="wpr-data"></ul>

        </div>

    </div>
    <?php
}

// add wc reorder (submenu page)

if (is_admin()) {
    add_action('admin_menu', 'wpr_add_products_menu_entry', 100);
}

function wpr_add_products_menu_entry()
{
    add_submenu_page(
        'edit.php?post_type=product',
        'Product Re-Order',
        'WC Reorder',
        'manage_woocommerce', // Required user capability
        'wpr-reorder',
        'wpr_reorder_do_page'
    );
}

function wpr_filter(array &$array)
{
    array_walk_recursive($array, function (&$value) {
        $value = filter_var(trim($value), FILTER_SANITIZE_STRING);
    });

    return $array;
}

function wpr_update_order()
{
    global $wpdb;

    // Make sure things are set before using them
    $items = isset($_POST['obj']) ? (array) $_POST['obj'] : array();

    $items = wpr_filter($items);
    //   update_post_meta($post->ID, 'wpr_items', $items);
    //var_dump($items);

    foreach ($items as $item) {

        $data = array(
            'menu_order' => $item["menu_order"],
        );
        $data = apply_filters('post-types-order_save-ajax-order', $data, $item["menu_order"], $item["ID"]);
        $wpdb->update($wpdb->posts, $data, array('ID' => $item["ID"]));
    }

    die();
}

add_action('wp_ajax_nopriv_wpr_order', 'wpr_update_order');
add_action('wp_ajax_wpr_order', 'wpr_update_order');

function wpr_textdomain()
{
    load_theme_textdomain('we-reorder', get_template_directory() . '/languages');
}
add_action('after_setup_theme', 'wpr_textdomain');

function wpr_strings($translated_text, $text, $domain)
{
    switch ($translated_text) {
        case 'Reorder Title':
            $translated_text = esc_html_e('WooCommerce Product Reorder', 'wpr-reorder');
            break;
    }
    return $translated_text;
}
add_filter('gettext', 'wpr_strings', 20, 3);