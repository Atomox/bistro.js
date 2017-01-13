<html>
	<body>
		<h1>
			{{ [message|string] }}
		</h1>
		<hr>
		{{ 
			[body|text] 
		}}
		<div class="People">
			{{ 
			#if people
				#each people }}
					<li> {{ [first|string] [last|string] }} </li>
				{{ 
				/each
			/if
			}}
		</div>
	</body>
</html>