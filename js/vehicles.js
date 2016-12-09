
$(document).ready(function(e) {
		
		$(".menu_1").click(function(){
			
			$(this).next(".menu_2").slideToggle(500).siblings(".menu_2").slideUp(".menu_2");
		
		});
			
});
