<html>
	<body>
		{{ #template 'staff/modules/my_first_module/my_first_header.tpl':header /template }}
		

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