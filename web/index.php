<?php include("includes/header.php") ?>
<main style="padding-top:70px">

	<section class="m-t-quarter-space" style="margin:0 0 30px 0">
		<div class="o-container o-container__medium p-t-space p-b-space c-hero b-homepanel">
			<h1 class="title--l m-text-align--center" style="text-shadow:1px 0px 0px white;">Datasetregister</h1>
			<h2 class="title--m m-text-align--center" style="text-shadow:1px 0px 0px white;">Voor alle erfgoeddatasets!</h2>
			<p class=" m-text-align--center" style="text-shadow:1px 0px 0px white;">Het datasetregister geeft inzicht in de beschikbaarheid van datasets in het erfgoedveld en stimuleert daarmee het gebruik van deze datasets.</p>
		</div>
	</section>
   
	<section id="" class="m-flex c-module c-module--doorway p-t-space p-b-space">
		<div class="o-container o-container__medium m-theme-bg b-homepanel" style="padding:10px 0 10px 0!important;">
			<div class="c-grid__row item-in-view p-b-half-space inview" style="margin:0;padding:0;text-align:center">
				<div class="all-1_2 tablet-portrait-1_2 phablet-1_1">
					<a href="/viaurl.php"><span class="btn btn--arrow m-t-half-space btn--api">Voor erfgoedinstellingen met datasets:<br>voeg een datasetbeschrijving toe <svg class="rect"> <rect class="svgrect" width="100%" height="100%" style="stroke-width: 3; fill: transparent; stroke-dasharray: 0; stroke-dashoffset: 0;"></rect> </svg> <svg class="icon icon-arrow-right"> <use xlink:href="#icon-arrow-right"></use> </svg> </span></a>
				</div>
				<div class="all-1_2 tablet-portrait-1_2 phablet-1_1" style="margin:0;padding:0;text-align:center">				
					<a href="/search.php"><span class="btn btn--arrow m-t-half-space btn--api">Voor gebruikers van erfgoeddata:<br>doorzoek <span id="datasetcount">alle</span> datasetbeschrijvingen <svg class="rect"> <rect class="svgrect" width="100%" height="100%" style="stroke-width: 3; fill: transparent; stroke-dasharray: 0; stroke-dashoffset: 0;"></rect> </svg> <svg class="icon icon-arrow-right"> <use xlink:href="#icon-arrow-right"></use> </svg> </span></a>
				</div>
			</div>
		</div>
	</section>
   
   <section id="" class="m-flex c-module c-module--icon-row m-t-space m-bg--light p-t-space p-b-space">
      <div class="o-container o-container__medium">
         <div class="c-grid__row item-in-view inview">
            <div class="all-1_3 phablet-1_1 item-in-view inview">
               <div class="c-grid__col m-text-align--center">
                  <div class="text m-t-half-space">
                     <h3>Ben je actief met datasets bij een erfgoedinstelling?</h3>
                     <ul class="list--quicklinks">
                        <li><a href="/form.php">Maak een datasetbeschrijving</a></li>
                        <li><a href="/viaurl.php">Voeg een datasetbeschrijving toe</a></li>
						<li><a href="/faq-beheerders.php">Veelgestelde vragen door dataset beheerders</a></li>
                     </ul>
                  </div>
               </div>
            </div>
            <div class="all-1_3 phablet-1_1 item-in-view inview">
               <div class="c-grid__col m-text-align--center">
                  <div class="text m-t-half-space">
                     <h3>Ben je op zoek naar erfgoeddatasets?</h3>
                     <ul class="list--quicklinks">
                        <li><a target="datastory" href="https://demo.netwerkdigitaalerfgoed.nl/stories/hackalod/datasetregister/">Leer via de Data story hoe te zoeken</a></li>
                        <li><a target="triplestore" href="/search.php">Doorzoek alle datasetbeschrijvingen</a></li>
                        <li><a href="/faq-gebruikers.php">Veelgestelde vragen door dataset gebruikers</a></li>
                     </ul>
                  </div>
               </div>
            </div>
            <div class="all-1_3 phablet-1_1 item-in-view inview">
               <div class="c-grid__col m-text-align--center">
                  <div class="text m-t-half-space">
                     <h3>Ontwikkel je software voor erfgoedinstellingen?</h3>
                     <ul class="list--quicklinks">
                        <li><a target="triplestore" href="https://netwerk-digitaal-erfgoed.github.io/requirements-datasets/">Eisen gesteld aan datasetbeschrijvingen</a></li>
                        <li><a href="/validate.php">Valideer een datasetbeschrijving</a></li>
                        <li><a target="datastory" href="https://register-demo.coret.org/apidoc.php">Documentatie van de API</a></li>
                        <li><a href="/faq-ontwikkelaars.php">Veelgestelde vragen door ontwikkelaars</a></li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </section>
</main>

<script>
document.addEventListener('DOMContentLoaded', () => get_count());

function get_count() {
	var url = "https://triplestore.netwerkdigitaalerfgoed.nl/repositories/registry?query=SELECT%20(COUNT(%20DISTINCT%20%3Fdataset)%20as%20%3FpCount)%20WHERE%20%7B%20%3Fdataset%20a%20%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Fdcat%23Dataset%3E%20%7D";

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url);

	xhr.setRequestHeader("Accept", "application/json");

	xhr.onreadystatechange = function () {
	   if (xhr.readyState === 4) {
		  if(xhr.status==200) {
			show_count(xhr.responseText);
		  }
	   }};

	xhr.send();
}

function show_count(response) {
	//console.log(response);
	try {
		results = JSON.parse(response);
		document.getElementById("datasetcount").innerHTML="<b>"+results.results.bindings[0].pCount.value+"</b>";
	} catch (err) {
		console.log(err);
	}
}

</script>

<?php include("includes/footer.php") ?>