
<div class="People">
	{{ #if people }}
		{{ #each people }}
			{{ #template people__person /template }}
		{{ /each }}
	{{ /if }}
</div>