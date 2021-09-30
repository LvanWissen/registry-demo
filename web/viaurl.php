<?php include("includes/header.php") ?>
<main>
   <section class="text m-t-space m-b-space m-theme--blue">
      <div class="o-container o-container__small m-t-space">
         <h1 class="title--l">Datasetbeschrijving aanmelden</h1>
         <p>Voer een URL in van een pagina met een schema.org/Dataset of schema.org/DataCatalog (inline JSON-LD of direct RDF) om deze via de <a href="apidoc.php">Datasetregister API</a> aan te melden. Als de domeinnaam voorkomt op de lijst van toegestane domeinnamen (zie <a href="faq-ontwikkelaars.php#allowed_domain_names">FAQ</a>) en de aangetroffen datasetbeschrijving(en) voldoen aan de <a href="https://netwerk-digitaal-erfgoed.github.io/requirements-datasets/" target="_blank">dataset requirements</a> dan zullen deze in het Datasetregister worden opgenomen.</p>
         <p>
            <input type="url" id="datasetdescriptionurl" placeholder="URL van pagina met datasetbeschrijving" class="form-control form-control-lg" name="db_url" value="https://demo.netwerkdigitaalerfgoed.nl/datasets/kb/2.html"><br>
            <button class="btn btn-success" onclick="call_api()">URL datasetbeschrijving toevoegen</button>
         </p>
         <br/>
         <xmp id="api_result"></xmp>
         </p>
      </div>
   </section>
</main>
<script>
   function call_api() {
   	document.getElementById("api_result").innerHTML="Calling API ..."; 
   	fetch("https://datasetregister.netwerkdigitaalerfgoed.nl/api/datasets", {
   	  "method": "POST",
   	  "headers": {
   		"Link": "<http://www.w3.org/ns/ldp#RDFSource>; rel=\"type\",<http://www.w3.org/ns/ldp#Resource>; rel=\"type\"",
   		"Content-Type": "application/ld+json"
   	  },
   	  "body": JSON.stringify( {"@id": document.getElementById("datasetdescriptionurl").value })
   	})
   	.then(response => { 
   		document.getElementById("api_result").innerHTML="Status: "+response.status+"\n\n"; 
   		return response.text(); 
   	})
   	.then(response => {
   		document.getElementById("api_result").innerHTML+=response
   	})
   	.catch(err => {
   	  console.log(err);
   	});
   }
</script>
<?php include("includes/footer.php") ?>