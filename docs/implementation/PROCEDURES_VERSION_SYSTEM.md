# Version Comparison System - TrakNor CMMS

## Overview

The TrakNor CMMS now includes a comprehensive version comparison system for procedures that allows users to track changes, compare different versions, and rollback to previous versions when necessary.

## Features

### 1. Automatic Version Tracking

Every change to a procedure automatically creates a new version entry with:

- **Version Number**: Incrementing version numbers (v1, v2, v3, etc.)
- **Change Type**: Categorized changes (created, updated, file_updated, status_changed, category_changed)
- **Change Summary**: Optional description of what changed
- **Timestamp**: When the change was made
- **File Checksum**: To detect file content changes

### 2. Version History

Access complete version history through the procedure viewer:

- **History Tab**: View all versions in chronological order
- **Version Details**: See metadata for each version (title, category, status, tags, file info)
- **Change Indicators**: Visual badges showing the type of change made
- **Download Options**: Download files from any version

### 3. Version Comparison

Compare any two versions to see exactly what changed:

- **Side-by-Side View**: Compare version metadata side by side
- **Diff Detection**: Automatic detection of changes in:
  - Title
  - Description
  - Category
  - Status
  - Tags
  - File content (via checksum)
- **Visual Diff**: Color-coded display of additions, removals, and modifications
- **Change Summary**: Optional summary explaining the changes

### 4. Rollback Functionality

Restore procedures to any previous version:

- **One-Click Rollback**: Restore from version history table
- **Backup Before Rollback**: Current version is saved before rollback
- **Version Increment**: Rollback creates a new version (no data loss)
- **Audit Trail**: Complete record of all rollback operations

## User Interface

### Procedure Viewer Tabs

The procedure viewer now includes two main tabs:

1. **Document Tab**: View and interact with the procedure file
2. **History Tab**: Access version history and comparison tools

### Version History Table

- **Version Column**: Shows version number with "atual" badge for current version
- **Change Type**: Color-coded badges for different change types
- **File Info**: File name, type, and size for each version
- **Actions**: Compare, Download, and Rollback buttons

### Version Comparison Dialog

- **Version Selection**: Choose which versions to compare
- **Auto-Selection**: Automatically selects latest two versions
- **Change Detection**: Lists all differences found
- **Restore Options**: Quick rollback from comparison view

## Technical Implementation

### Data Models

```typescript
interface ProcedureVersion {
  id: string;
  procedure_id: string;
  version_number: number;
  title: string;
  description?: string;
  category_id?: string | null;
  status: ProcedureStatus;
  tags?: string[];
  file: ProcedureFileRef;
  change_type: VersionChangeType;
  change_summary?: string;
  created_at: string;
}

interface VersionComparison {
  fromVersion: ProcedureVersion;
  toVersion: ProcedureVersion;
  diffs: ProcedureDiff[];
  hasFileChanges: boolean;
}
```

### Storage Strategy

- **Metadata**: Stored in localStorage as JSON
- **Files**: Stored in IndexedDB for binary data
- **Checksums**: SHA-like checksums for file change detection
- **Version History**: Separate storage key for version tracking

### API Functions

```typescript
// Version management
listVersions(procedureId?: string): ProcedureVersion[]
createVersion(procedure: Procedure, changeType: VersionChangeType, changeSummary?: string): ProcedureVersion
getVersionById(versionId: string): ProcedureVersion | null

// Comparison
compareVersions(fromVersionId: string, toVersionId: string): VersionComparison | null

// Rollback
rollbackToVersion(procedureId: string, versionId: string): Promise<Procedure | null>
```

## Usage Guide

### Viewing Version History

1. Open any procedure in the viewer
2. Click the "Histórico" tab
3. Browse through all versions in the table
4. Use action buttons to compare, download, or rollback

### Comparing Versions

1. From the History tab, click "Comparar" next to any version
2. Or click "Comparar Versões" in the toolbar
3. Select the versions you want to compare
4. Review the differences highlighted in the comparison view

### Rolling Back Changes

1. In the version history table, find the version you want to restore
2. Click the rollback button (↻)
3. Confirm the rollback operation
4. The procedure will be restored to the selected version

### Understanding Change Types

- **Criação**: Initial creation of the procedure
- **Atualização**: General updates to metadata
- **Arquivo atualizado**: File content was changed
- **Status alterado**: Status changed (Ativo/Inativo)
- **Categoria alterada**: Category assignment changed

## Security Considerations

- **File Checksums**: Prevent unauthorized file modifications
- **Audit Trail**: Complete record of all changes and who made them
- **No Data Loss**: Rollback preserves all versions
- **Safe Rendering**: Markdown content is sanitized to prevent XSS

## Performance Optimizations

- **Lazy Loading**: Versions loaded only when history tab is accessed
- **IndexedDB**: Efficient storage for large binary files
- **Checksums**: Fast file change detection without content comparison
- **Pagination**: Version history can be paginated for procedures with many versions

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all version operations
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Version comparison uses color and symbols
- **Focus Management**: Proper focus handling in dialogs and modals

## Future Enhancements

- **Merge Conflicts**: Detection and resolution of concurrent edits
- **Branch Management**: Support for multiple development branches
- **Approval Workflows**: Version approval before going live
- **Export Options**: Export version history and comparisons
- **Automated Backup**: Scheduled backups of all versions

## Testing

The version comparison system includes comprehensive tests covering:

- Version creation and tracking
- Diff detection algorithms
- Rollback functionality
- Edge cases and error handling
- User interface interactions
- Accessibility compliance

Run tests with:
```bash
npm test src/components/procedure/__tests__/VersionComparison.test.ts
```

## Troubleshooting

### Common Issues

1. **Missing Versions**: Clear localStorage and reinitialize storage
2. **File Not Found**: Check IndexedDB storage and file references
3. **Comparison Errors**: Verify both versions exist and have valid IDs
4. **Rollback Failures**: Ensure target version exists and procedure is not locked

### Debug Commands

```javascript
// List all versions for a procedure
console.log(listVersions('procedure-id'));

// Check file storage
console.log(await getFileBlob('file-id'));

// Compare specific versions  
console.log(compareVersions('version-1-id', 'version-2-id'));
```