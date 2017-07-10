<HTML>
<HEAD>
	<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css" type="text/css" >
	{{ #include css:my_first_theme /include }}
</HEAD>
<BODY>

	<div class="row">
	    <div class="col-xs-12">

	    	<header>
				{{ #template header /template }}
			</header>
			<div id="content">
				{{ #template content /template }}
			</div>
			<footer>
				{{ #template footer /template }}
			</footer>

	    </div>
	</div>

</BODY>
</HTML>