(
	function (nsObj, undefined) {
		let $ = jQuery;

		const keyA = "2c32bf3eb06b30af5f8208481aea3e8b"; //demo key
		const keyB = "f599f68840eadc23261239307f05ab24"; //test key
		const keyC = "638cf5af3a1030ba2ff3fe9b5cdd828a"; //prod key
		const interval = 500;
		let typingTimer;
		let currentPage = 1;
		let limit = 10;
		let total = 0;
		let url;
		let loading = false;
		const client = new AddSearchClient(keyC);
		client.setPaging(1, limit, "relevance", "desc");
		nsObj.doSearch = function() {
			//console.log("search-button clicked");
			client.search($("#beca_search_input").val(), nsObj.displayResults);
		};

		nsObj.cb = function(res) {
			console.log(res);
		}
		nsObj.hideResults = function() {
			$("#beca_results_container").hide();
			$("#beca_search_input").css("border-radius", "26px");
		}
		nsObj.moveUp = function () {
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
		nsObj.moveDown = function () {
			console.log("Down Arrow Pressed");
		}
		nsObj.toggleActive = function (element) {
			url = element.find("a").prop("href");
			element.toggleClass("active");
			$(".active").on("click", function () {
				window.location.href = url;
			});
			$(".active").on("keypress", function (e) {
				if(e.keyCode === 13) {
					window.location.href = url;
				}
			});
		}	

		// --- zobrazovaci funkce pro konstrukci šablony

		nsObj.displayResults = function(res) {
			$("#beca_results_container").show();
			$('#beca_results_list').empty();
			nsObj.appendResults(res);
		}
		nsObj.hasMoreResults = function () {
			return ((currentPage - 1) * limit + 1) < total;
		}
		nsObj.loadResults = async function () {
			loading = true;
			if(nsObj.hasMoreResults()) {
				client.nextPage();
				await client.search($("#beca_search_input").val(), nsObj.appendResults);
				loading = false;
			}
			
		}
		nsObj.appendResults = function (res) {
			total = res.total_hits || total;
			currentPage = res.page || currentPage;
			$("#beca_number_of_results").empty().append(
				(total > 0)
					? `${currentPage * limit} z ${total} výsledků.`
					: `<h6>Žádný výsledek nenalezen.</h6>`
			);
			if(total > 0) {
				res.hits.forEach(nsObj.buildRow);
				$(".beca_loader_wrapper").detach();
				$("#beca_results_list").append(`
					<div class="beca_loader_wrapper">
						<div class="beca_loader">
							<div></div><div></div><div></div><div></div>
						</div>
					</div>	
				`);
				$(".beca_grid_container").hover(function () {
					nsObj.toggleActive($(this))
				});													
				$(".beca_results_about").each(function () {
					let wordArray = $(this).html().split(' ');
					while($(this).outerHeight() > $(this).offsetHeight) {
						wordArray.pop();
						$(this).html(wordArray.join(' ') + '...');
			 		}
				});
				$("#beca_results_list").on("scroll", function() {
					if ($(this).scrollTop() == $(this).prop("scrollHeight") - $(this).height() && nsObj.hasMoreResults() && loading === false) {
						nsObj.loadResults();
					}
				});
			}
		}
		nsObj.buildRow = function(hit) {
			const about = hit.custom_fields.about ? nsObj.regFirstWords(hit.custom_fields.about, 40) : '';
			const categories = hit.custom_fields.categories ? nsObj.assignType(hit.custom_fields.categories) : '';		
			const courses = hit.custom_fields.courses ?? '';
			return $("#beca_results_list").append(`
				<div class="beca_grid_container">
					<div class="beca_main_image ${hit.document_type ?? ''} ${(hit.images.main) ? '' : 'noimage'}"
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
						<a href="${hit.url}" data-analytics="${hit.id}">${hit.title}</a>
					</div>
					<div class="beca_results_about">
						${about}
					</div>
					<div class="beca_results_categories">
						${categories}
					</div>
					<div class="beca_results_courses">
						${courses}
					</div>
			`);
		}

	// --- pomocne funkce AKA helpery

		nsObj.regFirstWords = function(s, n) {
			// ?: non-capturing subsequent sp+word.Change {} if you want to require n instead of allowing fewer
			return s.replace(/\s+/g," ").split(/(?=\s)/gi).slice(0, n).join('');
		}
		nsObj.assignType = function(v) {
			switch(typeof v) {
				case 'string':
					return v;
				case 'object':
					return [... v].join(' ');
				case 'undefined':
					return '';	
			}	 	
		}
		
		nsObj.ready = function ($) {
			$(function() {
			/*$("#search-input").on('keydown', function(e) {
				if(e.keyCode == '38' || e.keyCode == '40') {e.preventDefault();}
			});*/
				$("#beca_search_input").on('keyup', function(e) {
					switch(e.keyCode) {
						case 13: // Enter Key
							nsObj.doSearch();
							break;
						case 27: //Esc Key
							nsObj.hideResults();
							break;	
						case 38: // Up Arrow Key
							nsObj.moveUp();
							break;
						case 40: // Down Arrow Key
							nsObj.moveDown();
							break;
						default:	
							clearTimeout(typingTimer);
							if ($('#beca_search_input').val().length) {
							typingTimer = setTimeout(nsObj.doSearch, interval);
						}
					}
				});
				$("#beca_searchfield_container").children().on("click", function(e) {
					e.stopPropagation();
				});
				$(document).on("click", nsObj.hideResults);
				$("#nextPage").on("click", function () {
					console.log("Next Page clicked!");
					client.nextPage();
					console.log();
				});
			});
		}	
	} (window.UIsearch = window.UIsearch || {})
);
UIsearch.ready($);

