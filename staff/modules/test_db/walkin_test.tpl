<html>
	<head>
	</head>
	<body>
	
	<h1>{{ [title] }}</h1>

	<ul>

	{{ #unless people }}
		<h2>Dave's not hear, man!</h2>
	{{ /unless }}

	{{ #each rows }}
		<li>{{ [id] [': '] [body] }}</li>
	{{ /each }}
	</ul>
	</body>
</html>


