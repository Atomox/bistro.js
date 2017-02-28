<HTML>
<HEAD>
	{{ #include css:my_first_theme /include }}
</HEAD>
<BODY>
	<header>
		{{ #template header /template }}
	</header>
	<content>
		{{ #template content /template }}
	</content>
	<footer>
		{{ [footer.copyright] }}
		<small>{{ [footer.legal] }}</small>
	</footer>
</BODY>
</HTML>