jQuery(document).ready(function($){
    $(window).scroll(function(){
        if ($(this).scrollTop() > 50) {
            $('#toTop').fadeIn('slow');
        } else {
            $('#toTop').fadeOut('slow');
        }
    });
    $('#toTop').click(function(){
        $("html, body").animate({ scrollTop: 0 }, 500);
        //$("html, body").scrollTop(0); //For without animation
        return false;
    });
});