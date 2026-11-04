# 01 — Inventaire de l'application Vue (référence)

> Généré par script le 2026-11-04 sur `feat/angular-migration` (base `main` deee662). Chemins relatifs à la racine.

## Chiffres
- Composants `.vue` : **533** (64174 lignes)
- Modules `.ts` hors tests : **432** ; dont couplés à Vue/Pinia/VueUse/router/reka/TanStack-Vue/icônes Vue : **118** ; indépendants du framework : **314** (conservés tels quels, règle 4)

## Routes (`src/router/index.ts`)
| Chemin | Composant |
|---|---|
| `/` | `views/LandingPage.vue` |
| `/scenario/:scenarioId` | `modules/scenarioeditor/ScenarioEditorWrapper.vue` ; enfants : `""` → `modules/maplibreview/ScenarioEditorMaplibre.vue`, `grid-edit` → `GridEditView.vue`, `chart-edit` → `ChartEditView.vue`, redirections `maplibre`, `legacy` |
| `/newscenario` | `modules/scenarioeditor/NewScenarioView.vue` |
| `/text-to-orbat` | `views/texttoorbat/TextToOrbatView.vue` |
| `/import` | `views/ImportScenarioView.vue` |
| `/symbol-browser` | `views/SymbolBrowserView.vue` |
| `/globe/:scenarioId` | redirection |

## Mécanismes Vue utilisés

### Teleport — 3 fichiers
`src/components/ScenarioImportContribution.vue`, `src/modules/maplibreview/MaplibreMap.vue`, `src/modules/maplibreview/imageExport/ExportViewfinderOverlay.vue`

### Transition — 1 fichiers
`src/modules/maplibreview/ViewshedDeck.vue`

### defineModel (v-model personnalisé) — 92 fichiers
`src/components/AddMapServerDialog.vue`, `src/components/BaseLayerSwitcher.vue`, `src/components/CheckboxDropdown.vue`, `src/components/ChevronPanel.vue`, `src/components/ColorPicker.vue`, `src/components/CoordinateInput.vue`, `src/components/DecryptScenarioModal.vue`, `src/components/DeleteStoredScenariosModal.vue`, `src/components/EchelonSizesDialog.vue`, `src/components/EditToggleButton.vue`, `src/components/EditableLabel.vue`, `src/components/EncryptScenarioModal.vue`, `src/components/ExportScenarioModal.vue`, `src/components/ExportSettingsCsv.vue`, `src/components/ExportSettingsGeoJson.vue`, `src/components/ExportSettingsKmlKmz.vue`, `src/components/ExportSettingsOrbatMapper.vue`, `src/components/ExportSettingsSpatialIllusions.vue`, `src/components/ExportSettingsXlsx.vue`, `src/components/FieldSelect.vue`, `src/components/FilterQueryInput.vue`, `src/components/ImportModal.vue`, `src/components/InputCheckbox.vue`, `src/components/InputDateModal.vue`, `src/components/InputGroup.vue`, `src/components/InputRadio.vue`, `src/components/LanguageSelect.vue`, `src/components/MainViewSlideOver.vue`, `src/components/NewAccordionPanel.vue`, `src/components/NewSelect.vue`, `src/components/NewSimpleModal.vue`, `src/components/NumberInputGroup.vue`, `src/components/OpacityInput.vue`, `src/components/PopoverColorPicker.vue`, `src/components/RadioGroupList.vue`, `src/components/ResizablePanel.vue`, `src/components/ScenarioFeatureSelect.vue`, `src/components/SearchModal.vue`, `src/components/SearchModalInput.vue`, `src/components/ShareScenarioModal.vue`, `src/components/ShareScenarioUrlModal.vue`, `src/components/ShortcutsModal.vue`, `src/components/SimpleCombo.vue`, `src/components/SimpleMarkdownInput.vue`, `src/components/SimpleModal.vue`, `src/components/SimpleSelect.vue`, `src/components/SlideOver.vue`, `src/components/StandardIdentitySelect.vue`, `src/components/SymbolCodeMultilineSelect.vue`, `src/components/SymbolCodeSelect.vue`, `src/components/SymbolExportMenu.vue`, `src/components/SymbolFillColorSelect.vue`, `src/components/SymbolPickerModal.vue`, `src/components/TimeDateSettingsDetails.vue`, `src/components/TimezoneSelect.vue`, `src/components/ToggleField.vue`, `src/components/UnitTreeSelect.vue`, `src/components/ZoomSelector.vue`, `src/components/commandPalette/CommandPalette.vue`, `src/components/commandPalette/CommandPaletteInput.vue`, `src/modules/charteditor/OrbatChartExportDialog.vue`, `src/modules/charteditor/OrbatChartSettings.vue`, `src/modules/grid/OrbatGrid.vue`, `src/modules/grid/OrbatGridHeader.vue`, `src/modules/grid/ToeGrid.vue`, `src/modules/maplibreview/LabelledSlider.vue`, `src/modules/maplibreview/MaplibreContextMenu.vue`, `src/modules/scenarioeditor/AddCustomSymbolForm.vue`, `src/modules/scenarioeditor/AddNameDescriptionForm.vue`, `src/modules/scenarioeditor/AddSupplyCategoryForm.vue`, `src/modules/scenarioeditor/AddSupplyUoMForm.vue`, `src/modules/scenarioeditor/AddSymbolFillColorForm.vue`, `src/modules/scenarioeditor/AddUnitSupplyForm.vue`, `src/modules/scenarioeditor/AddUnitToeItemForm.vue`, `src/modules/scenarioeditor/ControlMeasureLayer.vue`, `src/modules/scenarioeditor/ControlMeasurePickerDialog.vue`, `src/modules/scenarioeditor/FilterTree.vue`, `src/modules/scenarioeditor/LayerItemTreeSelect.vue`, `src/modules/scenarioeditor/LoadScenarioDialog.vue`, `src/modules/scenarioeditor/ModifyUnitSupplyForm.vue`, `src/modules/scenarioeditor/ModifyUnitToeItemForm.vue`, `src/modules/scenarioeditor/RangeRingGroupRow.vue`, `src/modules/scenarioeditor/RingStylePopover.vue`, `src/modules/scenarioeditor/ScenarioDraftRecoveryModal.vue`, `src/modules/scenarioeditor/ScenarioEventLocation.vue`, `src/modules/scenarioeditor/ScenarioFeatureArrowSelect.vue`, `src/modules/scenarioeditor/ScenarioFeatureLayer.vue`, `src/modules/scenarioeditor/ScenarioLeavePromptModal.vue`, `src/modules/scenarioeditor/TextAmpInput.vue`, `src/modules/scenarioeditor/ToeGridHeader.vue`, `src/modules/scenarioeditor/TransformForm.vue`, `src/views/texttoorbat/PatternMappingModal.vue`

### provide() — 8 fichiers
`src/components/MRadioGroup.vue`, `src/components/ui/toggle-group/ToggleGroup.vue`, `src/modules/maplibreview/MlMapLogic.vue`, `src/modules/maplibreview/ScenarioEditorMaplibre.vue`, `src/modules/maplibreview/TerrainMapToggle.vue`, `src/modules/scenarioeditor/ControlMeasuresTabPanel.vue`, `src/modules/scenarioeditor/ScenarioEditor.vue`, `src/geo/mapHover.ts`

### inject() — 19 fichiers
`src/components/EncryptScenarioModal.vue`, `src/components/InputRadio.vue`, `src/components/ShareScenarioModal.vue`, `src/components/ShareScenarioUrlModal.vue`, `src/components/SymbolFillColorSelect.vue`, `src/components/SymbolPickerModal.vue`, `src/components/UnitSymbol.vue`, `src/modules/maplibreview/MlMapLogic.vue`, `src/modules/scenarioeditor/ControlMeasureCatalogueReadout.vue`, `src/modules/scenarioeditor/ControlMeasureDefaultsPopover.vue`, `src/modules/scenarioeditor/ControlMeasuresTabPanel.vue`, `src/modules/scenarioeditor/KeyboardScenarioActions.vue`, `src/modules/scenarioeditor/MapEditorMeasurementToolbar.vue`, `src/modules/scenarioeditor/ScenarioLayersTabPanel.vue`, `src/geo/mapHover.ts`, `src/modules/scenarioeditor/useOwnedUndoRedo.ts`, `src/modules/scenarioeditor/useScenarioDraw.ts`, `src/modules/scenarioeditor/useScenarioRouting.ts`, `src/utils/injects.ts`

### raccourcis clavier — 14 fichiers
`src/components/SearchModal.vue`, `src/components/SimpleMarkdownInput.vue`, `src/components/TimeController.vue`, `src/modules/maplibreview/ScenarioEditorMaplibre.vue`, `src/modules/scenarioeditor/KeyboardScenarioActions.vue`, `src/modules/scenarioeditor/ScenarioEditor.vue`, `src/modules/scenarioeditor/ScenarioFeatureDetails.vue`, `src/modules/scenarioeditor/ScenarioMapModeShell.vue`, `src/modules/scenarioeditor/TimelineChangesLanes.vue`, `src/modules/scenarioeditor/UnitDetails.vue`, `src/composables/geoBoxDraw.ts`, `src/composables/geoMapLocation.ts`, `src/composables/maplibreMeasurement.ts`, `src/modules/scenarioeditor/useScenarioDraw.ts`

### drag-and-drop — 32 fichiers
`src/components/DropIndicator.vue`, `src/components/OrbatSide.vue`, `src/components/OrbatSideGroup.vue`, `src/components/OrbatTreeItem.vue`, `src/components/ScenarioLinkCard.vue`, `src/components/TreeDropIndicator.vue`, `src/components/UnitSymbol.vue`, `src/modules/scenarioeditor/ControlMeasureCatalogueTile.vue`, `src/modules/scenarioeditor/ControlMeasureLayer.vue`, `src/modules/scenarioeditor/ControlMeasureListItem.vue`, `src/modules/scenarioeditor/ControlMeasuresTabPanel.vue`, `src/modules/scenarioeditor/ItemMedia.vue`, `src/modules/scenarioeditor/OrbatPanel.vue`, `src/modules/scenarioeditor/RangeRingLayer.vue`, `src/modules/scenarioeditor/ScenarioEventDetails.vue`, `src/modules/scenarioeditor/ScenarioFeatureLayer.vue`, `src/modules/scenarioeditor/ScenarioFeatureListItem.vue`, `src/modules/scenarioeditor/ScenarioLayersTabPanel.vue`, `src/modules/scenarioeditor/ScenarioReferenceLayerRow.vue`, `src/modules/scenarioeditor/UnitBreadcrumbItem.vue`, `src/modules/scenarioeditor/UnitBreadcrumbs.vue`, `src/modules/scenarioeditor/UnitDetails.vue`, `src/views/DemoScenarioCards.vue`, `src/views/texttoorbat/OrbatTreeNode.vue`, `src/views/texttoorbat/PatternMappingModal.vue`, `src/views/texttoorbat/ScratchPad.vue`, `src/views/texttoorbat/ScratchPadTreeNode.vue`, `src/views/texttoorbat/TextToOrbatView.vue`, `src/composables/filedragdrop.ts`, `src/composables/useMapDropTarget.ts`, `src/modules/maplibreview/useMaplibreMapDrop.ts`, `src/types/draggables.ts`

### listes virtualisées — 5 fichiers
`src/components/UnitTreeSelect.vue`, `src/modules/grid/DataGrid.vue`, `src/modules/scenarioeditor/GridEditView.vue`, `src/modules/scenarioeditor/TimelineChangesLanes.vue`, `src/modules/scenarioeditor/TimelineChangesList.vue`

### tables TanStack — 25 fichiers
`src/components/ImportGenericStep.vue`, `src/components/ImportGeojsonStep.vue`, `src/components/ImportMilxStep.vue`, `src/components/ImportOdinStep.vue`, `src/components/ImportOrbatMapperStep.vue`, `src/components/ImportSpatialIllusionsStep.vue`, `src/components/ScenarioImportContribution.vue`, `src/modules/grid/DataGrid.vue`, `src/modules/grid/ToeGrid.vue`, `src/modules/scenarioeditor/ScenarioCustomSymbolSettings.vue`, `src/modules/scenarioeditor/ScenarioInfoEquipment.vue`, `src/modules/scenarioeditor/ScenarioInfoGroups.vue`, `src/modules/scenarioeditor/ScenarioInfoPersonnel.vue`, `src/modules/scenarioeditor/ScenarioInfoSupplies.vue`, `src/modules/scenarioeditor/ScenarioInfoSupplyClasses.vue`, `src/modules/scenarioeditor/ScenarioInfoSupplyUnits.vue`, `src/modules/scenarioeditor/ScenarioInfoUnitStatuses.vue`, `src/modules/scenarioeditor/ScenarioSymbolColorSettings.vue`, `src/modules/scenarioeditor/ToeGridTableMenu.vue`, `src/modules/scenarioeditor/UnitDetailsSupplies.vue`, `src/composables/toeUtils.ts`, `src/lib/utils.ts`, `src/modules/grid/helpers.ts`, `src/stores/tableStores.ts`, `src/types/tanstack-extras.d.ts`

### reka-ui (primitives headless) — 113 fichiers
`src/components/ColorPicker.vue`, `src/components/FilterQueryInput.vue`, `src/components/InputCheckbox.vue`, `src/components/OrbatSide.vue`, `src/components/OrbatTree.vue`, `src/components/PopoverColorPicker.vue`, `src/components/ScrollTabs.vue`, `src/components/StandardIdentitySelect.vue`, `src/components/SymbolPickerModal.vue`, `src/components/ZoomSlider.vue`, `src/components/commandPalette/CommandPalette.vue`, `src/components/commandPalette/CommandPaletteDialog.vue`, `src/components/commandPalette/CommandPaletteInput.vue`, `src/components/ui/badge/Badge.vue`, `src/components/ui/breadcrumb/BreadcrumbLink.vue`, `src/components/ui/button/Button.vue`, `src/components/ui/checkbox/Checkbox.vue`, `src/components/ui/collapsible/Collapsible.vue`, `src/components/ui/collapsible/CollapsibleContent.vue`, `src/components/ui/collapsible/CollapsibleTrigger.vue`, `src/components/ui/context-menu/ContextMenu.vue`, `src/components/ui/context-menu/ContextMenuCheckboxItem.vue`, `src/components/ui/context-menu/ContextMenuContent.vue`, `src/components/ui/context-menu/ContextMenuGroup.vue`, `src/components/ui/context-menu/ContextMenuItem.vue`, `src/components/ui/context-menu/ContextMenuLabel.vue`, `src/components/ui/context-menu/ContextMenuPortal.vue`, `src/components/ui/context-menu/ContextMenuRadioGroup.vue`, `src/components/ui/context-menu/ContextMenuRadioItem.vue`, `src/components/ui/context-menu/ContextMenuSeparator.vue`, `src/components/ui/context-menu/ContextMenuSub.vue`, `src/components/ui/context-menu/ContextMenuSubContent.vue`, `src/components/ui/context-menu/ContextMenuSubTrigger.vue`, `src/components/ui/context-menu/ContextMenuTrigger.vue`, `src/components/ui/dialog/Dialog.vue`, `src/components/ui/dialog/DialogClose.vue`, `src/components/ui/dialog/DialogContent.vue`, `src/components/ui/dialog/DialogDescription.vue`, `src/components/ui/dialog/DialogOverlay.vue`, `src/components/ui/dialog/DialogScrollContent.vue`, `src/components/ui/dialog/DialogTitle.vue`, `src/components/ui/dialog/DialogTrigger.vue`, `src/components/ui/dropdown-menu/DropdownMenu.vue`, `src/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue`, `src/components/ui/dropdown-menu/DropdownMenuContent.vue`, `src/components/ui/dropdown-menu/DropdownMenuGroup.vue`, `src/components/ui/dropdown-menu/DropdownMenuItem.vue`, `src/components/ui/dropdown-menu/DropdownMenuLabel.vue`, `src/components/ui/dropdown-menu/DropdownMenuRadioGroup.vue`, `src/components/ui/dropdown-menu/DropdownMenuRadioItem.vue`, `src/components/ui/dropdown-menu/DropdownMenuSeparator.vue`, `src/components/ui/dropdown-menu/DropdownMenuSub.vue`, `src/components/ui/dropdown-menu/DropdownMenuSubContent.vue`, `src/components/ui/dropdown-menu/DropdownMenuSubTrigger.vue`, `src/components/ui/dropdown-menu/DropdownMenuTrigger.vue`, `src/components/ui/item/Item.vue`, `src/components/ui/item/ItemSeparator.vue`, `src/components/ui/label/Label.vue`, `src/components/ui/native-select/NativeSelect.vue`, `src/components/ui/number-field/NumberField.vue`, `src/components/ui/number-field/NumberFieldDecrement.vue`, `src/components/ui/number-field/NumberFieldIncrement.vue`, `src/components/ui/number-field/NumberFieldInput.vue`, `src/components/ui/popover/Popover.vue`, `src/components/ui/popover/PopoverAnchor.vue`, `src/components/ui/popover/PopoverContent.vue`, `src/components/ui/popover/PopoverTrigger.vue`, `src/components/ui/radio-group/RadioGroup.vue`, `src/components/ui/radio-group/RadioGroupItem.vue`, `src/components/ui/resizable/ResizableHandle.vue`, `src/components/ui/resizable/ResizablePanel.vue`, `src/components/ui/resizable/ResizablePanelGroup.vue`, `src/components/ui/scroll-area/ScrollArea.vue`, `src/components/ui/scroll-area/ScrollBar.vue`, `src/components/ui/select/Select.vue`, `src/components/ui/select/SelectContent.vue`, `src/components/ui/select/SelectGroup.vue`, `src/components/ui/select/SelectItem.vue`, `src/components/ui/select/SelectItemText.vue`, `src/components/ui/select/SelectLabel.vue`, `src/components/ui/select/SelectScrollDownButton.vue`, `src/components/ui/select/SelectScrollUpButton.vue`, `src/components/ui/select/SelectSeparator.vue`, `src/components/ui/select/SelectTrigger.vue`, `src/components/ui/select/SelectValue.vue`, `src/components/ui/separator/Separator.vue`, `src/components/ui/sheet/Sheet.vue`, `src/components/ui/sheet/SheetClose.vue`, `src/components/ui/sheet/SheetContent.vue`, `src/components/ui/sheet/SheetDescription.vue`, `src/components/ui/sheet/SheetOverlay.vue`, `src/components/ui/sheet/SheetTitle.vue`, `src/components/ui/sheet/SheetTrigger.vue`, `src/components/ui/slider/Slider.vue`, `src/components/ui/switch/Switch.vue`, `src/components/ui/tabs/Tabs.vue`, `src/components/ui/tabs/TabsContent.vue`, `src/components/ui/tabs/TabsList.vue`, `src/components/ui/tabs/TabsTrigger.vue`, `src/components/ui/toggle-group/ToggleGroup.vue`, `src/components/ui/toggle-group/ToggleGroupItem.vue`, `src/components/ui/toggle/Toggle.vue`, `src/components/ui/tooltip/Tooltip.vue`, `src/components/ui/tooltip/TooltipContent.vue`, `src/components/ui/tooltip/TooltipProvider.vue`, `src/components/ui/tooltip/TooltipTrigger.vue`, `src/modules/maplibreview/LabelledSlider.vue`, `src/modules/scenarioeditor/ControlMeasurePickerDialog.vue`, `src/modules/scenarioeditor/FilterTree.vue`, `src/modules/scenarioeditor/RingStylePopover.vue`, `src/modules/scenarioeditor/ScenarioFeatureMarkerSettings.vue`, `src/views/SymbolBrowserView.vue`, `src/components/ui/dropdown-menu/index.ts`

### defineAsyncComponent — 16 fichiers
`src/components/ImportModal.vue`, `src/components/SymbolPickerModal.vue`, `src/modules/charteditor/OrbatChartSettingsChart.vue`, `src/modules/maplibreview/ScenarioEditorMaplibre.vue`, `src/modules/scenarioeditor/EditMetaForm.vue`, `src/modules/scenarioeditor/LoadScenarioDialog.vue`, `src/modules/scenarioeditor/MapEditorDesktopPanel.vue`, `src/modules/scenarioeditor/MapEditorMobilePanel.vue`, `src/modules/scenarioeditor/ScenarioEditor.vue`, `src/modules/scenarioeditor/ScenarioFeatureDetails.vue`, `src/modules/scenarioeditor/ScenarioInfoDetails.vue`, `src/modules/scenarioeditor/ScenarioToolsTabPanel.vue`, `src/modules/scenarioeditor/UnitDetails.vue`, `src/views/LandingPageScenarios.vue`, `src/views/SymbolBrowserView.vue`, `src/views/texttoorbat/PatternMappingModal.vue`

### v-html — 19 fichiers
`src/components/ImportOrbatMapperStep.vue`, `src/components/SearchFeatureHit.vue`, `src/components/SearchUnitHit.vue`, `src/components/SimpleMarkdownInput.vue`, `src/components/SymbolPickerModal.vue`, `src/components/commandPalette/CommandPaletteActionItem.vue`, `src/components/commandPalette/CommandPaletteEventItem.vue`, `src/components/commandPalette/CommandPaletteImageLayerItem.vue`, `src/components/commandPalette/CommandPaletteLayerFeatureItem.vue`, `src/components/commandPalette/CommandPaletteUnitItem.vue`, `src/modules/scenarioeditor/ControlMeasureDetails.vue`, `src/modules/scenarioeditor/PointSymbolDetails.vue`, `src/modules/scenarioeditor/ReferenceFeatureDetails.vue`, `src/modules/scenarioeditor/ScenarioEventDetails.vue`, `src/modules/scenarioeditor/ScenarioFeatureDetails.vue`, `src/modules/scenarioeditor/ScenarioInfoDetails.vue`, `src/modules/scenarioeditor/UnitDetails.vue`, `src/views/SymbolBrowserView.vue`, `src/composables/searching.ts`

### slots — 212 composants (projection de contenu)

## Composants par dossier (nom (lignes))

### `src/` (1)
`App.vue` (12)

### `src/components/` (163)
`AccordionPanel.vue` (49), `AddMapServerDialog.vue` (108), `AlertWarning.vue` (18), `AppNotifications.vue` (32), `BaseButton.vue` (29), `BaseLayerSwitcher.vue` (139), `BaseToolbar.vue` (3), `ButtonGroup.vue` (30), `CellSizeIcon.vue` (25), `CheckboxDropdown.vue` (67), `ChevronPanel.vue` (79), `CloseButton.vue` (11), `ColorDot.vue` (24), `ColorPicker.vue` (60), `CoordinateInput.vue` (153), `CreateEmtpyDashed.vue` (22), `DebugInfo.vue` (24), `DecryptScenarioModal.vue` (99), `DeleteStoredScenariosModal.vue` (57), `DescriptionItem.vue` (17), `DocLink.vue` (11), `DotsMenu.vue` (61), `DragHandle.vue` (101), `DrawArrow.vue` (75), `DrawMarker.vue` (88), `DrawRangeRingMarker.vue` (110), `DropIndicator.vue` (57), `EchelonSizesDialog.vue` (329), `EditSideForm.vue` (62), `EditSideGroupForm.vue` (70), `EditToggleButton.vue` (15), `EditableLabel.vue` (47), `EncryptScenarioModal.vue` (98), `ExportScenarioModal.vue` (351), `ExportSettingsCsv.vue` (89), `ExportSettingsGeoJson.vue` (31), `ExportSettingsKmlKmz.vue` (227), `ExportSettingsOrbatMapper.vue` (496), `ExportSettingsSpatialIllusions.vue` (45), `ExportSettingsXlsx.vue` (75), `FieldSelect.vue` (47), `FilterQueryInput.vue` (76), `FloatingPanel.vue` (5), `FormCard.vue` (23), `FpsDisplay.vue` (10), `HeadingDescription.vue` (5), `IconButton.vue` (52), `ImportGenericStep.vue` (1179), `ImportGeojsonStep.vue` (403), `ImportImageStep.vue` (94), `ImportKMLStep.vue` (286), `ImportLoadStep.vue` (456), `ImportMilxStep.vue` (268), `ImportModal.vue` (208), `ImportOdinStep.vue` (183), `ImportOrbatGeneratorStep.vue` (107), `ImportOrbatMapperStep.vue` (618), `ImportSpatialIllusionsStep.vue` (169), `ImportSpreadsheetStep.vue` (42), `ImportStepLayout.vue` (68), `ImportedFileList.vue` (38), `InlineAlertWarning.vue` (18), `InlineFormPanel.vue` (25), `InputCheckbox.vue` (43), `InputDateModal.vue` (91), `InputGroup.vue` (46), `InputGroupTemplate.vue` (34), `InputRadio.vue` (47), `LanguageSelect.vue` (152), `LayersPanel.vue` (267), `LegacyConverter.vue` (69), `LinkButton.vue` (9), `MRadioGroup.vue` (9), `MainToolbarButton.vue` (20), `MainViewSlideOver.vue` (58), `MapHoverFeatureTooltip.vue` (84), `MapSettingsPanel.vue` (79), `MapTimeController.vue` (77), `MilSymbol.vue` (31), `MilitarySymbol.vue` (40), `NewAccordionPanel.vue` (38), `NewMilitarySymbol.vue` (53), `NewSelect.vue` (58), `NewSimpleModal.vue` (55), `NotificationItem.vue` (91), `NumberInputGroup.vue` (38), `ObserverHeightIcon.vue` (27), `OpacityInput.vue` (41), `OrbatCellRenderer.vue` (41), `OrbatPanelAddSide.vue` (38), `OrbatSide.vue` (392), `OrbatSideGroup.vue` (369), `OrbatTree.vue` (514), `OrbatTreeItem.vue` (351), `OverlayPanelIcon.vue` (18), `PanelDataGrid.vue` (14), `PanelHeading.vue` (5), `PanelResizeHandle.vue` (61), `PanelSubHeading.vue` (3), `PanelSymbolButton.vue` (28), `PlainButton.vue` (9), `PopoverColorPicker.vue` (172), `PrimaryButton.vue` (9), `PropertyInput.vue` (64), `ProseSection.vue` (9), `RadioGroupList.vue` (36), `ReachIcon.vue` (27), `RecordingState.vue` (155), `ResizablePanel.vue` (31), `ScenarioFeatureSelect.vue` (76), `ScenarioImportContribution.vue` (692), `ScenarioLinkCard.vue` (120), `ScrollTabs.vue` (126), `SearchFeatureHit.vue` (21), `SearchModal.vue` (159), `SearchModalInput.vue` (57), `SearchUnitHit.vue` (34), `SecondaryButton.vue` (7), `SettingsPanel.vue` (66), `ShareScenarioModal.vue` (190), `ShareScenarioUrlModal.vue` (91), `ShortcutsModal.vue` (50), `SimpleBreadcrumbs.vue` (47), `SimpleCombo.vue` (107), `SimpleDivider.vue` (14), `SimpleMarkdownInput.vue` (65), `SimpleModal.vue` (51), `SimpleSelect.vue` (50), `SlideOver.vue` (25), `SnapGroundIcon.vue` (32), `SortDropdown.vue` (64), `SplitButton.vue` (113), `SplitToolbarButton.vue` (57), `StandardIdentitySelect.vue` (120), `StoredScenarioBrowser.vue` (355), `SymbolBrowseTab.vue` (241), `SymbolCodeMultilineSelect.vue` (111), `SymbolCodeSelect.vue` (111), `SymbolCodeViewer.vue` (227), `SymbolExportMenu.vue` (223), `SymbolFillColorSelect.vue` (43), `SymbolPickerCustomSymbol.vue` (114), `SymbolPickerModal.vue` (510), `TableHeader.vue` (22), `TargetHeightIcon.vue` (27), `TextAreaGroup.vue` (47), `TimeController.vue` (77), `TimeDateSettingsDetails.vue` (50), `TimeDateSettingsPanel.vue` (43), `TimelineContextMenu.vue` (60), `TimezoneSelect.vue` (12), `ToggleField.vue` (17), `ToolbarButton.vue` (30), `ToolbarGroup.vue` (25), `TreeDropIndicator.vue` (66), `UnitSymbol.vue` (35), `UnitTreeSelect.vue` (332), `UnitTreeSelectRow.vue` (85), `VerticalToolbar.vue` (3), `ViewshedIcon.vue` (28), `WipBadge.vue` (13), `ZoomSelector.vue` (24), `ZoomSlider.vue` (49)

### `src/components/commandPalette/` (11)
`CommandPalette.vue` (220), `CommandPaletteActionItem.vue` (47), `CommandPaletteDialog.vue` (43), `CommandPaletteEventItem.vue` (22), `CommandPaletteFooter.vue` (41), `CommandPaletteHelp.vue` (14), `CommandPaletteImageLayerItem.vue` (17), `CommandPaletteInput.vue` (54), `CommandPaletteLayerFeatureItem.vue` (14), `CommandPalettePlaceItem.vue` (45), `CommandPaletteUnitItem.vue` (45)

### `src/components/ui/alert/` (3)
`Alert.vue` (21), `AlertDescription.vue` (22), `AlertTitle.vue` (19)

### `src/components/ui/badge/` (1)
`Badge.vue` (28)

### `src/components/ui/breadcrumb/` (7)
`Breadcrumb.vue` (13), `BreadcrumbEllipsis.vue` (23), `BreadcrumbItem.vue` (17), `BreadcrumbLink.vue` (24), `BreadcrumbList.vue` (22), `BreadcrumbPage.vue` (20), `BreadcrumbSeparator.vue` (22)

### `src/components/ui/button/` (1)
`Button.vue` (31)

### `src/components/ui/card/` (7)
`Card.vue` (22), `CardAction.vue` (19), `CardContent.vue` (14), `CardDescription.vue` (17), `CardFooter.vue` (17), `CardHeader.vue` (22), `CardTitle.vue` (14)

### `src/components/ui/checkbox/` (1)
`Checkbox.vue` (39)

### `src/components/ui/collapsible/` (3)
`Collapsible.vue` (15), `CollapsibleContent.vue` (12), `CollapsibleTrigger.vue` (12)

### `src/components/ui/context-menu/` (15)
`ContextMenu.vue` (15), `ContextMenuCheckboxItem.vue` (45), `ContextMenuContent.vue` (37), `ContextMenuGroup.vue` (12), `ContextMenuItem.vue` (42), `ContextMenuLabel.vue` (26), `ContextMenuPortal.vue` (12), `ContextMenuRadioGroup.vue` (15), `ContextMenuRadioItem.vue` (45), `ContextMenuSeparator.vue` (21), `ContextMenuShortcut.vue` (17), `ContextMenuSub.vue` (15), `ContextMenuSubContent.vue` (31), `ContextMenuSubTrigger.vue` (33), `ContextMenuTrigger.vue` (14)

### `src/components/ui/dialog/` (10)
`Dialog.vue` (15), `DialogClose.vue` (12), `DialogContent.vue` (54), `DialogDescription.vue` (23), `DialogFooter.vue` (15), `DialogHeader.vue` (17), `DialogOverlay.vue` (26), `DialogScrollContent.vue` (64), `DialogTitle.vue` (23), `DialogTrigger.vue` (12)

### `src/components/ui/dropdown-menu/` (14)
`DropdownMenu.vue` (15), `DropdownMenuCheckboxItem.vue` (48), `DropdownMenuContent.vue` (40), `DropdownMenuGroup.vue` (12), `DropdownMenuItem.vue` (41), `DropdownMenuLabel.vue` (25), `DropdownMenuRadioGroup.vue` (15), `DropdownMenuRadioItem.vue` (46), `DropdownMenuSeparator.vue` (23), `DropdownMenuShortcut.vue` (17), `DropdownMenuSub.vue` (15), `DropdownMenuSubContent.vue` (31), `DropdownMenuSubTrigger.vue` (31), `DropdownMenuTrigger.vue` (14)

### `src/components/ui/empty/` (6)
`Empty.vue` (22), `EmptyContent.vue` (22), `EmptyDescription.vue` (22), `EmptyHeader.vue` (17), `EmptyMedia.vue` (21), `EmptyTitle.vue` (17)

### `src/components/ui/field/` (10)
`Field.vue` (22), `FieldContent.vue` (19), `FieldDescription.vue` (24), `FieldError.vue` (54), `FieldGroup.vue` (22), `FieldLabel.vue` (25), `FieldLegend.vue` (26), `FieldSeparator.vue` (31), `FieldSet.vue` (23), `FieldTitle.vue` (22)

### `src/components/ui/input-group/` (6)
`InputGroup.vue` (37), `InputGroupAddon.vue` (39), `InputGroupButton.vue` (29), `InputGroupInput.vue` (21), `InputGroupText.vue` (21), `InputGroupTextarea.vue` (21)

### `src/components/ui/input/` (1)
`Input.vue` (35)

### `src/components/ui/item/` (10)
`Item.vue` (32), `ItemActions.vue` (14), `ItemContent.vue` (19), `ItemDescription.vue` (23), `ItemFooter.vue` (17), `ItemGroup.vue` (18), `ItemHeader.vue` (17), `ItemMedia.vue` (21), `ItemSeparator.vue` (16), `ItemTitle.vue` (19)

### `src/components/ui/kbd/` (2)
`Kbd.vue` (23), `KbdGroup.vue` (14)

### `src/components/ui/label/` (1)
`Label.vue` (26)

### `src/components/ui/native-select/` (3)
`NativeSelect.vue` (61), `NativeSelectOptGroup.vue` (17), `NativeSelectOption.vue` (18)

### `src/components/ui/number-field/` (5)
`NumberField.vue` (24), `NumberFieldContent.vue` (21), `NumberFieldDecrement.vue` (33), `NumberFieldIncrement.vue` (33), `NumberFieldInput.vue` (21)

### `src/components/ui/popover/` (4)
`Popover.vue` (15), `PopoverAnchor.vue` (12), `PopoverContent.vue` (41), `PopoverTrigger.vue` (12)

### `src/components/ui/radio-group/` (2)
`RadioGroup.vue` (25), `RadioGroupItem.vue` (38)

### `src/components/ui/resizable/` (3)
`ResizableHandle.vue` (39), `ResizablePanel.vue` (16), `ResizablePanelGroup.vue` (25)

### `src/components/ui/scroll-area/` (2)
`ScrollArea.vue` (29), `ScrollBar.vue` (36)

### `src/components/ui/select/` (11)
`Select.vue` (15), `SelectContent.vue` (60), `SelectGroup.vue` (12), `SelectItem.vue` (44), `SelectItemText.vue` (12), `SelectLabel.vue` (17), `SelectScrollDownButton.vue` (28), `SelectScrollUpButton.vue` (28), `SelectSeparator.vue` (19), `SelectTrigger.vue` (37), `SelectValue.vue` (12)

### `src/components/ui/separator/` (1)
`Separator.vue` (30)

### `src/components/ui/sheet/` (9)
`Sheet.vue` (15), `SheetClose.vue` (12), `SheetContent.vue` (60), `SheetDescription.vue` (21), `SheetFooter.vue` (15), `SheetHeader.vue` (12), `SheetOverlay.vue` (26), `SheetTitle.vue` (21), `SheetTrigger.vue` (12)

### `src/components/ui/slider/` (1)
`Slider.vue` (51)

### `src/components/ui/spinner/` (1)
`Spinner.vue` (17)

### `src/components/ui/switch/` (1)
`Switch.vue` (40)

### `src/components/ui/tabs/` (4)
`Tabs.vue` (24), `TabsContent.vue` (21), `TabsList.vue` (26), `TabsTrigger.vue` (28)

### `src/components/ui/textarea/` (1)
`Textarea.vue` (33)

### `src/components/ui/toggle-group/` (2)
`ToggleGroup.vue` (59), `ToggleGroupItem.vue` (51)

### `src/components/ui/toggle/` (1)
`Toggle.vue` (40)

### `src/components/ui/tooltip/` (4)
`Tooltip.vue` (15), `TooltipContent.vue` (47), `TooltipProvider.vue` (14), `TooltipTrigger.vue` (12)

### `src/modules/charteditor/` (10)
`OrbatChart.vue` (141), `OrbatChartExportDialog.vue` (205), `OrbatChartSettings.vue` (57), `OrbatChartSettingsBranch.vue` (29), `OrbatChartSettingsChart.vue` (155), `OrbatChartSettingsLevel.vue` (72), `OrbatChartSettingsUnit.vue` (44), `SettingsConnectors.vue` (35), `SettingsToe.vue` (29), `SettingsUnit.vue` (89)

### `src/modules/grid/` (6)
`DataGrid.vue` (346), `GridHeaderResizeHandle.vue` (47), `OrbatGrid.vue` (257), `OrbatGridGroupRow.vue` (44), `OrbatGridHeader.vue` (94), `ToeGrid.vue` (316)

### `src/modules/maplibreview/` (13)
`HillshadeSettingsControl.vue` (100), `LabelledSlider.vue` (30), `MaplibreContextMenu.vue` (900), `MaplibreLabsPopover.vue` (315), `MaplibreMap.vue` (551), `MaplibreSearchScenarioActions.vue` (114), `MlMapLogic.vue` (1712), `ReferenceGridControl.vue` (171), `ScenarioEditorMaplibre.vue` (468), `TerrainExaggerationControl.vue` (37), `TerrainMapToggle.vue` (104), `TerrainMenu.vue` (159), `ViewshedDeck.vue` (755)

### `src/modules/maplibreview/imageExport/` (2)
`ExportImageForm.vue` (921), `ExportViewfinderOverlay.vue` (351)

### `src/modules/scenarioeditor/` (161)
`AddCustomSymbolForm.vue` (121), `AddNameDescriptionForm.vue` (54), `AddSupplyCategoryForm.vue` (87), `AddSupplyUoMForm.vue` (53), `AddSymbolFillColorForm.vue` (57), `AddUnitSupplyForm.vue` (80), `AddUnitToeItemForm.vue` (92), `ChartEditView.vue` (197), `ControlMeasureAmplifiers.vue` (193), `ControlMeasureCatalogueReadout.vue` (29), `ControlMeasureCatalogueTile.vue` (150), `ControlMeasureColorPicker.vue` (47), `ControlMeasureDefaultsPopover.vue` (245), `ControlMeasureDetails.vue` (550), `ControlMeasureDoctrinalParameters.vue` (160), `ControlMeasureEchelonSelect.vue` (80), `ControlMeasureExtendedStyleSettings.vue` (194), `ControlMeasureLayer.vue` (340), `ControlMeasureListItem.vue` (186), `ControlMeasureParameterField.vue` (176), `ControlMeasurePickerDialog.vue` (147), `ControlMeasurePreview.vue` (197), `ControlMeasureQuickTools.vue` (111), `ControlMeasureSizeSettings.vue` (112), `ControlMeasureStrokeWidthChoices.vue` (38), `ControlMeasureStyleSettings.vue` (424), `ControlMeasuresTabPanel.vue` (318), `DetailsPanelContent.vue` (87), `DetailsPanelHeader.vue` (71), `DrawSelectionTools.vue` (77), `DrawSessionActionBar.vue` (117), `DrawToolSplitButton.vue` (64), `EchelonPickerPopover.vue` (50), `EditLayerInlineForm.vue` (107), `EditMediaForm.vue` (47), `EditMetaForm.vue` (244), `FeatureStateGeometryForm.vue` (74), `FeatureTransformations.vue` (292), `FilterTree.vue` (173), `FormFooter.vue` (32), `GridEditView.vue` (849), `GridEditableCell.vue` (124), `GridHeader.vue` (104), `GridSideGroupRow.vue` (79), `GridSideRow.vue` (58), `GridUnitRow.vue` (87), `ImageMapLayerSettings.vue` (110), `ImportLoadStepBrowser.vue` (44), `InlineFormWrapper.vue` (15), `ItemMedia.vue` (31), `KeyboardScenarioActions.vue` (199), `LayerHeaderActions.vue` (27), `LayerItemActions.vue` (64), `LayerItemGlyph.vue` (48), `LayerItemTreeSelect.vue` (130), `LoadScenarioDialog.vue` (114), `LoadScenarioFromClipboardPanel.vue` (67), `LoadScenarioFromUrlPanel.vue` (82), `LoadScenarioPanel.vue` (66), `LoadScenarioUrlForm.vue` (87), `MainMenu.vue` (329), `MapEditorDesktopPanel.vue` (115), `MapEditorDetailsPanel.vue` (84), `MapEditorDrawToolbar.vue` (148), `MapEditorMainToolbar.vue` (438), `MapEditorMeasurementToolbar.vue` (130), `MapEditorMobilePanel.vue` (210), `MapEditorRouteContent.vue` (448), `MapEditorSubToolbar.vue` (77), `MapEditorUnitTrackToolbar.vue` (55), `MapLayerMetaSettings.vue` (63), `MapLayerMetaSettingsForm.vue` (56), `ModifyUnitSupplyForm.vue` (140), `ModifyUnitToeItemForm.vue` (145), `NewScenarioView.vue` (340), `OrbatPanel.vue` (487), `OrbatPanelFooterToolbar.vue` (73), `PanelTitle.vue` (5), `PlaybackMenu.vue` (119), `PointSymbolAmplifiers.vue` (104), `PointSymbolDetails.vue` (408), `RangeRingGroupRow.vue` (64), `RangeRingLayer.vue` (327), `RangeRingListItem.vue` (39), `RangeRingSwatch.vue` (30), `ReferenceFeatureDetails.vue` (123), `RingStylePopover.vue` (179), `ScenarioBoundingBox.vue` (248), `ScenarioCustomSymbolSettings.vue` (172), `ScenarioDraftRecoveryModal.vue` (35), `ScenarioEditor.vue` (729), `ScenarioEditorWrapper.vue` (195), `ScenarioEventDetails.vue` (238), `ScenarioEventDropdownMenu.vue` (35), `ScenarioEventLocation.vue` (247), `ScenarioEventsPanel.vue` (128), `ScenarioFeatureArrowSelect.vue` (63), `ScenarioFeatureArrowSettings.vue` (48), `ScenarioFeatureDetails.vue` (552), `ScenarioFeatureDropdownMenu.vue` (48), `ScenarioFeatureFillSettings.vue` (65), `ScenarioFeatureGeometryStats.vue` (238), `ScenarioFeatureLayer.vue` (338), `ScenarioFeatureListItem.vue` (157), `ScenarioFeatureMarkerSettings.vue` (120), `ScenarioFeatureStrokeSettings.vue` (102), `ScenarioFeatureStyleGroup.vue` (93), `ScenarioFeatureTextSettings.vue` (111), `ScenarioFeatureVisibilitySettings.vue` (45), `ScenarioFeaturesGeometryStats.vue` (186), `ScenarioFiltersTabPanel.vue` (859), `ScenarioInfoDetails.vue` (159), `ScenarioInfoEquipment.vue` (138), `ScenarioInfoGroups.vue` (120), `ScenarioInfoPanel.vue` (60), `ScenarioInfoPersonnel.vue` (135), `ScenarioInfoSupplies.vue` (155), `ScenarioInfoSupplyClasses.vue` (122), `ScenarioInfoSupplyUnits.vue` (137), `ScenarioInfoUnitStatuses.vue` (132), `ScenarioLayerItemState.vue` (94), `ScenarioLayersTabPanel.vue` (833), `ScenarioLeavePromptModal.vue` (33), `ScenarioMapLayerDetails.vue` (195), `ScenarioMapModeShell.vue` (180), `ScenarioMapSettings.vue` (309), `ScenarioNotFoundPage.vue` (26), `ScenarioReferenceLayerRow.vue` (194), `ScenarioSettingsPanel.vue` (102), `ScenarioSymbolColorSettings.vue` (134), `ScenarioTimeline.vue` (553), `ScenarioToolsTabPanel.vue` (169), `SettingsItemForm.vue` (124), `SideDropdownMenu.vue` (116), `SideGroupDropdownMenu.vue` (86), `SymbolPickerPopover.vue` (134), `TextAmpInput.vue` (9), `TileMapLayerSettings.vue` (88), `TileMapLayerSettingsForm.vue` (150), `TimelineChangeEntity.vue` (54), `TimelineChangesEnd.vue` (70), `TimelineChangesLanes.vue` (861), `TimelineChangesList.vue` (386), `TimelineChangesNowLine.vue` (24), `TimelineChangesPanel.vue` (424), `ToeGridHeader.vue` (45), `ToeGridTableMenu.vue` (60), `TransformForm.vue` (254), `UnitBreadcrumbItem.vue` (66), `UnitBreadcrumbs.vue` (242), `UnitDetails.vue` (803), `UnitDetailsMapDisplay.vue` (422), `UnitDetailsProperties.vue` (104), `UnitDetailsSupplies.vue` (299), `UnitDetailsSymbol.vue` (665), `UnitDetailsToe.vue` (396), `UnitHierarchyEditorModal.vue` (166), `UnitLocateButton.vue` (77), `UnitPanelState.vue` (517), `UnitSelectionSummary.vue` (123), `UnitStatusPopover.vue` (51)

### `src/views/` (7)
`DemoScenarioCards.vue` (74), `DemoScenarioNotice.vue` (21), `ImportScenarioView.vue` (412), `LandingPage.vue` (219), `LandingPageLinks.vue` (33), `LandingPageScenarios.vue` (209), `SymbolBrowserView.vue` (405)

### `src/views/texttoorbat/` (6)
`OrbatTreeNode.vue` (116), `PatternMappingModal.vue` (1869), `ScratchPad.vue` (542), `ScratchPadTreeNode.vue` (192), `TextToOrbatEditor.vue` (274), `TextToOrbatView.vue` (731)

## Stores Pinia (`src/stores/`)
`controlMeasureToolStore.ts`, `dragStore.ts`, `geoEditorViewStore.ts`, `geoStore.ts`, `importExportStore.ts`, `mainToolbarStore.ts`, `mapSelectStore.ts`, `mapSettingsStore.ts`, `mapViewStore.ts`, `maplibreLayersStore.ts`, `playbackStore.ts`, `recordingStore.ts`, `referenceGridStore.ts`, `routingStore.ts`, `scenarioInfoPanelStore.ts`, `scenarioStore.ts`, `selectedStore.ts`, `selectedWaypoints.ts`, `settingsStore.ts`, `tabStore.ts`, `tableStores.ts`, `terrainStore.ts`, `timeFormatStore.ts`, `timelineChangesStore.ts`, `toeStore.ts`, `transformStore.ts`, `uiStore.ts`, `viewshedStore.ts`

## Composables (`src/composables/`)
- `src/composables/basemapArchives.ts` — couplé Vue
- `src/composables/boxDrawEngineML.ts` — indépendant
- `src/composables/browserScenarios.ts` — couplé Vue
- `src/composables/customBasemaps.ts` — couplé Vue
- `src/composables/elevationArchive.ts` — couplé Vue
- `src/composables/filedragdrop.ts` — couplé Vue
- `src/composables/filtering.ts` — indépendant
- `src/composables/formatting.ts` — indépendant
- `src/composables/forms.ts` — couplé Vue
- `src/composables/geoBoxDraw.ts` — couplé Vue
- `src/composables/geoMapLayers.ts` — couplé Vue
- `src/composables/geoMapLocation.ts` — couplé Vue
- `src/composables/geosearching.ts` — couplé Vue
- `src/composables/immerStore.ts` — couplé Vue
- `src/composables/import/useColumnMapping.ts` — couplé Vue
- `src/composables/import/useMappedData.ts` — couplé Vue
- `src/composables/import/useSheetData.ts` — couplé Vue
- `src/composables/import/useUpdateMatching.ts` — couplé Vue
- `src/composables/importScenarioTransfer.ts` — indépendant
- `src/composables/legDeparture.ts` — indépendant
- `src/composables/mainToolbarData.ts` — couplé Vue
- `src/composables/maplibreDayNightTerminator.ts` — couplé Vue
- `src/composables/maplibreDrawInteraction.ts` — couplé Vue
- `src/composables/maplibreMeasurement.ts` — couplé Vue
- `src/composables/maplibreRangeRings.ts` — indépendant
- `src/composables/maplibreSnapping.ts` — indépendant
- `src/composables/maplibreTouchDrawing.ts` — indépendant
- `src/composables/maplibreUnitHistory.ts` — couplé Vue
- `src/composables/modals.ts` — couplé Vue
- `src/composables/notifications.ts` — couplé Vue
- `src/composables/scenarioActions.ts` — couplé Vue
- `src/composables/scenarioImport.ts` — indépendant
- `src/composables/scenarioShare.ts` — couplé Vue
- `src/composables/scenarioTime.ts` — couplé Vue
- `src/composables/scenarioUtils.ts` — couplé Vue
- `src/composables/searchActions.ts` — indépendant
- `src/composables/searching.ts` — indépendant
- `src/composables/selectionActions.ts` — indépendant
- `src/composables/symbolData.ts` — couplé Vue
- `src/composables/symbolExport.ts` — couplé Vue
- `src/composables/symbolSearching.ts` — couplé Vue
- `src/composables/timing.ts` — couplé Vue
- `src/composables/toeUtils.ts` — couplé Vue
- `src/composables/unitEditTargets.ts` — couplé Vue
- `src/composables/useMapDropTarget.ts` — couplé Vue
- `src/composables/useMaplibreBoxSelect.ts` — indépendant
- `src/composables/useOverlayBottomInset.ts` — couplé Vue
- `src/composables/useScenarioFileLoader.ts` — couplé Vue
- `src/composables/utils.ts` — couplé Vue

## Modules hors composables/stores couplés à Vue
- `src/components/eventKeys.ts` : @vueuse/core
- `src/components/helpers.ts` : @vueuse/core, vue
- `src/components/injects.ts` : @vueuse/core, vue
- `src/components/types.ts` : vue
- `src/components/ui/dropdown-menu/index.ts` : reka-ui
- `src/geo/controlMeasures.ts` : vue
- `src/geo/engines/maplibre/mapLibreScenarioLayerController.ts` : vue
- `src/geo/engines/maplibre/tacticalDrawSurface.ts` : vue
- `src/geo/engines/maplibre/unitHitBox.ts` : vue
- `src/geo/mapHover.ts` : @vueuse/core, vue
- `src/geo/measurementTypes.ts` : vue
- `src/geo/pointSymbols.ts` : vue
- `src/geo/routing/mapLibreRoutingPreview.ts` : vue
- `src/lib/utils.ts` : @tanstack/vue-table, vue
- `src/main.ts` : pinia, vue
- `src/modules/charteditor/chartSettingsStore.ts` : pinia
- `src/modules/charteditor/composables.ts` : vue
- `src/modules/grid/gridTypes.ts` : vue
- `src/modules/grid/helpers.ts` : @tanstack/vue-table, vue
- `src/modules/maplibreview/h3grid/useH3HexGrid.ts` : @vueuse/core, vue
- `src/modules/maplibreview/referenceGridLayersRuntime.ts` : vue
- `src/modules/maplibreview/symbolImageRegistry.ts` : vue
- `src/modules/maplibreview/useMapOrbit.ts` : vue
- `src/modules/maplibreview/useMapTerrain.ts` : vue
- `src/modules/maplibreview/useMapViewshed.ts` : vue
- `src/modules/maplibreview/useMaplibreRotateInteraction.ts` : pinia, vue
- `src/modules/maplibreview/useReferenceGridLayers.ts` : vue
- `src/modules/maplibreview/useTacticalGraphicRenderFeed.ts` : vue
- `src/modules/maplibreview/viewshedLayers.ts` : vue
- `src/modules/scenarioeditor/controlMeasureCatalogue.ts` : @vueuse/core, vue
- `src/modules/scenarioeditor/featureLayerUtils.ts` : @iconify-prerendered/vue-mdi
- `src/modules/scenarioeditor/scenarioMapLayerUtils.ts` : @iconify-prerendered/vue-mdi
- `src/modules/scenarioeditor/useControlMeasureDrawSession.ts` : vue
- `src/modules/scenarioeditor/useControlMeasureEditSession.ts` : vue
- `src/modules/scenarioeditor/useOwnedUndoRedo.ts` : vue
- `src/modules/scenarioeditor/usePointSymbolDrawSession.ts` : vue
- `src/modules/scenarioeditor/useScenarioClipboardImport.ts` : vue
- `src/modules/scenarioeditor/useScenarioDraw.ts` : pinia, vue
- `src/modules/scenarioeditor/useScenarioFeatureSelection.ts` : vue
- `src/modules/scenarioeditor/useScenarioMapModeController.ts` : @vueuse/core, pinia, vue
- `src/modules/scenarioeditor/useScenarioMapSearchActions.ts` : @vueuse/core, vue
- `src/modules/scenarioeditor/useScenarioRouting.ts` : @vueuse/core, vue
- `src/modules/scenarioeditor/useTimelineChanges.ts` : pinia, vue
- `src/router/history.ts` : vue-router
- `src/router/index.ts` : vue-router
- `src/scenariostore/geo.ts` : @vueuse/core, vue
- `src/scenariostore/index.ts` : vue
- `src/scenariostore/io.ts` : @vueuse/core, vue
- `src/scenariostore/time.ts` : @vueuse/core, vue
- `src/scenariostore/unitManipulations.ts` : vue
- `src/shims-vue.d.ts` : vue
- `src/testdata/viewshed.ts` : vue
- `src/types/tanstack-extras.d.ts` : @tanstack/vue-table
- `src/utils/injects.ts` : vue
- `src/views/texttoorbat/textToOrbatStore.ts` : @vueuse/core, pinia, vue

## Hors `src/`
- `functions/share.ts` : Cloudflare Pages Function (partage en ligne R2/KV), hors app, inchangée.
- `scripts/` : génération MIL-STD-2525E, diff de symboles, `inlineMaplibreWorker.ts` (build singlefile).
- `vite.singlefile.config.ts` : build HTML autonome (substitution de modules `STANDALONE_MODULES`).
- `user-docs/` : documentation VitePress ; `public/` : démos, `config/maplibreConfig.json`, images.
