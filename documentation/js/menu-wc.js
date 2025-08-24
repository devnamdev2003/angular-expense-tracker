'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">expense-wise documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AddExpenseComponent.html" data-type="entity-link" >AddExpenseComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AiComponent.html" data-type="entity-link" >AiComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AnalysisComponent.html" data-type="entity-link" >AnalysisComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BudgetComponent.html" data-type="entity-link" >BudgetComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CalendarComponent.html" data-type="entity-link" >CalendarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CategoryDropdownComponent.html" data-type="entity-link" >CategoryDropdownComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CustomModalComponent.html" data-type="entity-link" >CustomModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ExpenseDetailsModalComponent.html" data-type="entity-link" >ExpenseDetailsModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ExpenseListComponent.html" data-type="entity-link" >ExpenseListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FooterComponent.html" data-type="entity-link" >FooterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GlobalLoaderComponent.html" data-type="entity-link" >GlobalLoaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GraphsComponent.html" data-type="entity-link" >GraphsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HamburgerMenuComponent.html" data-type="entity-link" >HamburgerMenuComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HomeComponent.html" data-type="entity-link" >HomeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/InfoIconComponent.html" data-type="entity-link" >InfoIconComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ListExpensesComponent.html" data-type="entity-link" >ListExpensesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MusicComponent.html" data-type="entity-link" >MusicComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NavbarComponent.html" data-type="entity-link" >NavbarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PieChartComponent.html" data-type="entity-link" >PieChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchButtonComponent.html" data-type="entity-link" >SearchButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchComponent.html" data-type="entity-link" >SearchComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SettingItemComponent.html" data-type="entity-link" >SettingItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SettingsComponent.html" data-type="entity-link" >SettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SidebarComponent.html" data-type="entity-link" >SidebarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ToastComponent.html" data-type="entity-link" >ToastComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AppVersionService.html" data-type="entity-link" >AppVersionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BudgetService.html" data-type="entity-link" >BudgetService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CategoryService.html" data-type="entity-link" >CategoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConfigService.html" data-type="entity-link" >ConfigService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExpenseService.html" data-type="entity-link" >ExpenseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GeminiApiService.html" data-type="entity-link" >GeminiApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GetApiService.html" data-type="entity-link" >GetApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GlobalLoaderService.html" data-type="entity-link" >GlobalLoaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PostApiService.html" data-type="entity-link" >PostApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SaavnService.html" data-type="entity-link" >SaavnService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SectionService.html" data-type="entity-link" >SectionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageService.html" data-type="entity-link" >StorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ToastService.html" data-type="entity-link" >ToastService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UtilsService.html" data-type="entity-link" >UtilsService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Budget.html" data-type="entity-link" >Budget</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Category.html" data-type="entity-link" >Category</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChatMessage.html" data-type="entity-link" >ChatMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Expense.html" data-type="entity-link" >Expense</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Schema.html" data-type="entity-link" >Schema</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});