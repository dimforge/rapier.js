
start_line=$(($(cat .gitignore | grep "### RAPIER_COMPAT_FILES" -n | cut -d : -f 1) + 1))

tail -n +$start_line .gitignore | while read file
do
  cp -r "../rapier-compat/$file" "./$file"
done
