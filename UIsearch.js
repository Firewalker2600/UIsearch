const keyA = "2c32bf3eb06b30af5f8208481aea3e8b"; //demo key
const keyB = "f599f68840eadc23261239307f05ab24"; //test key
const keyC = "638cf5af3a1030ba2ff3fe9b5cdd828a"; //prod key
const interval = 500;
var client = new AddSearchClient(keyA);
var cb = function(res) {
	console.log(res);
}
const doSearch = function() {
	//console.log("search-button clicked");
	client.search($("#beca_search_input").val(), displayResults);
}
const hideResults = function() {
	$("#beca_results_container").hide();
	$("#beca_search_input").css("border-radius", "26px");
}
const moveUp = function () {
	//console.log("Up Arrow Pressed");

	if($("#beca_results_container").is(":hidden")){
		return;
	} else if($(".beca_grid_container:first-of-type").hasClass("active")) {
		$(".beca_grid_container:first-of-type").removeClass("active");
		$("#beca_search_input").focus();
	} else {
		$("._beca_grid_container active").removeClass("active").prev().addClass("active");
	}
}
const moveDown = function () {
	console.log("Down Arrow Pressed");
}

let typingTimer;

$(function() {
	/*$("#search-input").on('keydown', function(e) {
		if(e.keyCode == '38' || e.keyCode == '40') {e.preventDefault();}
	});*/
	$("#beca_search_input").on('keyup', function() {
		switch(event.keyCode) {
			case 13: // Enter Key
				doSearch();
				break;
			case 27: //Esc Key
				hideResults();
				break;	
			case 38: // Up Arrow Key
				moveUp();
				break;
			case 40: // Down Arrow Key
				moveDown();
				break;
			default:	
				clearTimeout(typingTimer);
				if ($('#beca_search_input').val().length) {
				typingTimer = setTimeout(doSearch, interval);
			}
		}
	});
	$("#beca_searchfield_container").children().on("click", function(e) {
		e.stopPropagation();
	});
	$(document).on("click", hideResults);
	$(".beca_results_row").hover( function() {
		$(this).addClass("red");
	}, function() {
		$(this).removeClass("red");
	});
});


// --- zobrazovaci funkce pro konstrukci šablony

var displayResults = function(res) {
	cb(res);
	$("#beca_results_container").show();
	$("#beca_number_of_results").empty().append(
		(res.total_hits && res.total_hits > 0)
			? `${res.page * 1} - ${res.page * 10} z celkem ${res.total_hits} výsledků.`
			: `<h2>Žádný výsledek nenalezen.</h2>`
	);
	$('#beca_results_list').empty();
	if(res.total_hits && res.total_hits > 0) {
			res.hits.forEach(buildRow);
	}
};
var buildRow = function(hit) {
	//cb(hit.custom_fields.About);
	const hitTemplate =`
	<li class="beca_results_row">
	<div class="beca_grid_container">
		<div class="beca_main_image ${hit.document_type} ${(hit.images.main) ? '' : 'noimage'}"
		${hit.images.main
			? `style="background-image: url(data:image/jpeg;base64,${hit.images.main_b64}) no-repeat"`
			: ''
		}>
		${hit.images.main
			? `<img src="${hit.images.main}" alt="${hit.title}">`
			: ''
		}
		</div>
		<div class="beca_results_hit">
			<h3>
				<a href="${hit.url}" data-analytics="${hit.id}">${hit.title}</a>
			</h3>
		</div>
		<div class="beca_results_about">

		</div>
		</div>
	</li>`;
	$("#beca_results_list").append(hitTemplate);
}

// --- pomocne funkce AKA helpery

var regFirstWords = function(s, n) {
    // ?: non-capturing subsequent sp+word.Change {} if you want to require n instead of allowing fewer
    return s.replace(/\s+/g," ").split(/(?=\s)/gi).slice(0, n).join('');
}