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
					{{ #if first }}
						<li> {{ [first|string] [last|string] }} </li>
					{{ /if
				/each
			/if
			}}
		</div>
		<div class="Others">
		{{ #if others }}
			{{ #each others }}
			{{ /each }}
		{{ /if }}
		</div>
	</body>
</html>