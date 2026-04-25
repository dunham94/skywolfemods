const fs = require('fs');
const path = 'c:/Users/dunha/OneDrive/Desktop/calculadoramodelagem/client/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Adicionar </div> antes do </header>
content = content.replace(
  '            </nav>\n          </div>\n      </header>',
  '            </nav>\n          </div>\n        </div>\n      </header>'
);

fs.writeFileSync(path, content);
console.log('Corrigido!');
