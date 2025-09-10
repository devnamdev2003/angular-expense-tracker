<!-- install command -->
npm install --save apexcharts ng-apexcharts
npm install marked
npm install -g @compodoc/compodoc
npm install jspdf jspdf-autotable xlsx



commands:

# First install Globally Than use compodoc 

npm install -g @compodoc/compodoc

# Generate documentation
compodoc -p tsconfig.json

# Generate documentation and serve
compodoc -p tsconfig.json -s

# Serve compodoc
compodoc -s

# Or watch for changes
compodoc -p tsconfig.json -w

## Serve Documentation
compodoc -s



# Build for production
ng build --configuration production
# or
ng build --prod