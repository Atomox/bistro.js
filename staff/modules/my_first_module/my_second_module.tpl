<html>
	<body>
		{{ #if others == foo.bar.baz }} 
			Others is People
		{{ #elif foo.bar.baz }}
			Foo far!
		{{ #else }}
			{{ ['OTHERS ARE not people.'|lowercase] }}
		{{ /else }}	

		{{ #each basic_list }}
			({{ [.] }}) 
		{{ /each }}

		<p>
		{{ [basic_list|implode:' , '] }}
		</p>
	</body>
</html>