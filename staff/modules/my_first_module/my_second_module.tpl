<html>
	<body>
		{{ #if others == foo.bar.baz }} 
			Others is People
		{{ #elif foo.bar.baz }}
			Foo far!
		{{ #else }}
			{{ ['OTHERS ARE not people.'|lowercase] }}
		{{ /else }}	
	</body>
</html>